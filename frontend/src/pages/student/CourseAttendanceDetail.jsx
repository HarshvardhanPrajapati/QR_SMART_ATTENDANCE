import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const CourseAttendanceDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourseAttendance();
    }, [courseId]);

    const fetchCourseAttendance = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await API.get(`/student/courses/${courseId}/attendance`);
            
            if (!res.data) {
                throw new Error('No data received from server');
            }
            
            setCourse(res.data.course);
            setAttendance(res.data.attendance || []);
        } catch (err) {
            console.error('Error fetching course attendance:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load attendance data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50">
                <Navbar title="Course Attendance" />
                <div className="container mx-auto px-4 mt-8">
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50">
                <Navbar title="Course Attendance" />
                <div className="container mx-auto px-4 mt-8">
                    <p className="text-red-600">{error || 'Course not found'}</p>
                </div>
            </div>
        );
    }

    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const totalSessions = attendance.length;
    const attendancePercentage = totalSessions > 0 
        ? Math.round((presentCount / totalSessions) * 100) 
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 pb-10">
            <Navbar title="Course Attendance" />

            <div className="container mx-auto px-4 mt-8">
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                {/* Course Info Card */}
                <div className="glass-panel rounded-xl p-6 mb-6 border border-white/40 bg-white/70 backdrop-blur-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold bg-sky-100 text-sky-600 px-3 py-1 rounded">
                                    {course.code}
                                </span>
                                <span className="text-sm text-slate-600">
                                    {course.department} • Sem {course.semester}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {course.name}
                            </h1>
                            {course.teacher && (
                                <p className="text-sm text-slate-600">
                                    Teacher: {course.teacher.name}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-sky-600 mb-1">
                                {attendancePercentage}%
                            </div>
                            <p className="text-xs text-slate-600">Attendance</p>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="glass-panel rounded-xl p-4 border border-white/40 bg-white/70 backdrop-blur-md">
                        <p className="text-sm text-slate-600 mb-1">Total Sessions</p>
                        <p className="text-2xl font-bold text-slate-900">{totalSessions}</p>
                    </div>
                    <div className="glass-panel rounded-xl p-4 border border-white/40 bg-white/70 backdrop-blur-md">
                        <p className="text-sm text-slate-600 mb-1">Present</p>
                        <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                    </div>
                    <div className="glass-panel rounded-xl p-4 border border-white/40 bg-white/70 backdrop-blur-md">
                        <p className="text-sm text-slate-600 mb-1">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                    </div>
                </div>

                {/* Attendance List */}
                <div className="glass-panel rounded-xl p-6 border border-white/40 bg-white/70 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Attendance History
                    </h2>
                    {attendance.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto text-slate-400 mb-4" size={48} />
                            <p className="text-slate-600">No attendance records yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/60 border-b border-slate-200/60">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Date</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Time</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60">
                                    {attendance.map((record) => (
                                        <tr key={record.sessionId} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-slate-400" />
                                                    <span className="text-slate-900">
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-slate-400" />
                                                    <span>
                                                        {new Date(record.time).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {record.status === 'Present' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                                                        <CheckCircle size={14} />
                                                        Present
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                                                        <XCircle size={14} />
                                                        Absent
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseAttendanceDetail;

