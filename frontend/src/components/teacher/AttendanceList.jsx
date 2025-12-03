import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Download, User, UserCheck, UserX } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../../services/api';

const SOCKET_URL = 'http://localhost:5000';

const AttendanceList = ({ sessionData, attendanceData = [], showLiveButton = true }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Fetch enrolled students for the course linked to this session
    const fetchEnrolledStudents = useCallback(async () => {
        const courseId = sessionData?.course?._id || sessionData?.courseId || sessionData?.course;
        if (!courseId) {
            // No course yet (e.g. no session selected) – nothing to load
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Backend: GET /api/teacher/courses/:id/students -> array of Enrollment docs
            const res = await API.get(`/teacher/courses/${courseId}/students`);
            const enrollments = Array.isArray(res.data) ? res.data : [];

            // Map enrollments to flat student objects, all marked absent initially
            const studentsWithStatus = enrollments.map((enrollment) => {
                const stu = enrollment.student || {};
                const userObj = stu.user || { name: 'Unknown Student' };

                return {
                    _id: stu._id || enrollment._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
                    user: userObj,
                    rollNumber: stu.rollNumber || 'N/A',
                    status: 'absent',
                    attendanceTime: null,
                };
            });

            // Update with actual attendance data if available
            if (attendanceData && attendanceData.length > 0) {
                const attendanceMap = {};
                attendanceData.forEach(record => {
                    if (record.student) {
                        attendanceMap[record.student._id] = {
                            status: 'present',
                            attendanceTime: record.createdAt
                        };
                    }
                });

                const updatedStudents = studentsWithStatus.map(student => ({
                    ...student,
                    status: attendanceMap[student._id]?.status || 'absent',
                    attendanceTime: attendanceMap[student._id]?.attendanceTime || null
                }));

                setStudents(updatedStudents);
            } else {
                // If no attendance data yet, just set all as absent
                setStudents(studentsWithStatus);
            }
        } catch (err) {
            console.error('Error fetching enrolled students:', err);
            setError('Failed to load enrolled students');
        } finally {
            setLoading(false);
        }
    }, [sessionData, attendanceData]);

    // Set up socket event listeners
    useEffect(() => {
        if (!socket || !sessionData?._id) return;

        const handleAttendanceMarked = (data) => {
            if (data.sessionId === sessionData._id) {
                setStudents(prevStudents => 
                    prevStudents.map(student => 
                        student._id === data.studentId
                            ? { 
                                ...student, 
                                status: 'present',
                                attendanceTime: new Date().toISOString()
                            }
                            : student
                    )
                );
            }
        };

        socket.on('attendance:marked', handleAttendanceMarked);
        socket.emit('join:session', { sessionId: sessionData._id });

        return () => {
            socket.off('attendance:marked', handleAttendanceMarked);
            socket.emit('leave:session', { sessionId: sessionData._id });
        };
    }, [socket, sessionData?._id]);

    // Initial data fetch
    useEffect(() => {
        fetchEnrolledStudents();
    }, [fetchEnrolledStudents]);
    
    const exportToCSV = () => {
        const headers = ["Name", "Roll Number", "Status", "Time"];
        const rows = students.map(student => [
            student.user?.name || 'N/A',
            student.rollNumber || 'N/A',
            student.status,
            student.attendanceTime 
                ? new Date(student.attendanceTime).toLocaleTimeString() 
                : '—'
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_${sessionData.createdAt}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    if (!sessionData) {
        return <div className="text-slate-600">Select a session to view details.</div>;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                <span className="ml-2 text-slate-600">Loading attendance data...</span>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.length - presentCount;

    return (
        <div className="glass-panel rounded-xl shadow-sm border border-white/40 bg-white/70 backdrop-blur-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">
                        Session: {new Date(sessionData.createdAt).toLocaleDateString()}
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-sm mt-2">
                        <span className="text-slate-600">
                            {new Date(sessionData.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center text-emerald-600">
                            <UserCheck size={16} className="mr-1" />
                            {presentCount} Present
                        </span>
                        <span className="flex items-center text-red-500">
                            <UserX size={16} className="mr-1" />
                            {absentCount} Absent
                        </span>
                        <span className="flex items-center text-slate-600">
                            <User size={16} className="mr-1" />
                            {students.length} Total
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {showLiveButton && (
                        <button 
                            onClick={() => navigate(`/teacher/sessions/${sessionData._id}/live`)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-all"
                        >
                            Open Live View
                        </button>
                    )}
                    <button 
                        onClick={exportToCSV}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/60 text-slate-600 text-sm">
                            <th className="py-3 px-2">Student Name</th>
                            <th className="py-3 px-2">Roll No</th>
                            <th className="py-3 px-2">Time</th>
                            <th className="py-3 px-2">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr 
                                    key={student._id} 
                                    className={`transition-colors ${
                                        student.status === 'present' 
                                            ? 'bg-emerald-50/40' 
                                            : 'hover:bg-slate-50/40'
                                    }`}
                                >
                                    <td className="py-3 px-2 font-medium text-slate-900">
                                        {student.user?.name || 'N/A'}
                                    </td>
                                    <td className="py-3 px-2 text-slate-600">
                                        {student.rollNumber || '—'}
                                    </td>
                                    <td className="py-3 px-2 text-slate-600 text-sm font-mono">
                                        {student.attendanceTime 
                                            ? new Date(student.attendanceTime).toLocaleTimeString() 
                                            : '—'
                                        }
                                    </td>
                                    <td className="py-3 px-2">
                                        {student.status === 'present' ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                                <CheckCircle size={12} /> Present
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                                <XCircle size={12} /> Absent
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-slate-400">
                                {error || 'No students enrolled in this course.'}
                            </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceList;