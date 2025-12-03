import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import QRCodeDisplay from '../../components/teacher/QRCodeDisplay';
import AttendanceList from '../../components/teacher/AttendanceList';
import { motion } from 'framer-motion';
import { Play, Clock, ArrowLeft, X, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const GenerateQR = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [duration, setDuration] = useState(10); // Default 10 mins 
    const [activeSession, setActiveSession] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTerminating, setIsTerminating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await API.get('/teacher/courses'); // 
            setCourses(res.data);
            if (res.data.length > 0) setSelectedCourse(res.data[0]._id);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }
        
        setLoading(true);
        try {
            const res = await API.post('/teacher/sessions', {
                courseId: selectedCourse,
                timeInMinutes: duration
            });
            
            if (res.data) {
                // Set the session data to display the QR
                const newSession = {
                    ...res.data, // contains qrCode, sessionId, expiresAt
                    courseName: courses.find(c => c._id === selectedCourse)?.name,
                    _id: res.data.sessionId,
                    course: { _id: selectedCourse }
                };
                
                setActiveSession(newSession);
                setError(null);
                
                // Fetch initial attendance data
                try {
                    const attendanceRes = await API.get(`/teacher/sessions/${res.data.sessionId}/attendance`);
                    setAttendance(attendanceRes.data || []);
                } catch (err) {
                    console.error('Error loading attendance data', err);
                    setAttendance([]);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error creating session';
            alert(errorMessage);
            // If there's an active session, show it in the error
            if (error.response?.data?.activeSessionId) {
                alert('Please terminate the previous session first before creating a new one.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateSession = async () => {
        if (!window.confirm('Are you sure you want to end this session? This will prevent any further attendance marking.')) {
            return;
        }

        setIsTerminating(true);
        try {
            if (activeSession?.sessionId) {
                await API.put(`/teacher/sessions/${activeSession.sessionId}/cancel`);
            }
            setActiveSession(null);
            setAttendance([]);
            // Don't navigate away, just reset the form
        } catch (error) {
            console.error('Failed to terminate session:', error);
            setError('Failed to terminate session. Please try again.');
        } finally {
            setIsTerminating(false);
        }
    };

    // Set up WebSocket connection for real-time updates
    useEffect(() => {
        if (!activeSession?.sessionId) return;

        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            socket.emit('joinSession', activeSession.sessionId);
        });

        socket.on('attendance:marked', (payload) => {
            if (payload.sessionId === activeSession.sessionId) {
                setAttendance(prev => [...prev, payload.attendance]);
            }
        });

        // Fallback polling every 5 seconds in case sockets fail
        const interval = setInterval(async () => {
            try {
                const res = await API.get(`/teacher/sessions/${activeSession.sessionId}/attendance`);
                setAttendance(res.data || []);
            } catch (err) {
                console.error('Polling attendance failed', err);
            }
        }, 5000);

        return () => {
            socket.emit('leaveSession', activeSession.sessionId);
            socket.disconnect();
            clearInterval(interval);
        };
    }, [activeSession?.sessionId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 pb-10">
            <Navbar title="Live Session" />

            <div className="container mx-auto px-4 mt-8">
                {activeSession ? (
                    <div className="flex justify-between items-center mb-6">
                        <button 
                            onClick={() => navigate('/teacher/dashboard')}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft size={20} /> Back to Dashboard
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedCourse || activeSession}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {activeSession ? 'Session Active' : 'Creating...'}
                                </>
                            ) : activeSession ? (
                                <>
                                    <Play size={18} className="text-green-300" />
                                    Session Active
                                </>
                            ) : (
                                <>
                                    <Play size={18} />
                                    Start Session
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent mb-6">Classroom Mode</h1>
                )}

                {activeSession ? (
                    /* LIVE SESSION VIEW */
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-6xl mx-auto"
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live Session Active
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: QR Code */}
                            <div className="lg:col-span-1">
                                <div className="glass-panel rounded-xl shadow-sm border border-white/40 bg-white/70 backdrop-blur-md p-6 sticky top-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Scan QR Code</h3>
                                    <div className="flex justify-center">
                                        <QRCodeDisplay 
                                            qrData={activeSession.qrCode}
                                            expiresAt={activeSession.expiresAt}
                                            courseName={activeSession.courseName}
                                            onFullScreen={() => {}}
                                        />
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-slate-600">
                                            Students can scan this QR code to mark attendance
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Attendance List */}
                            <div className="lg:col-span-2">
                                <AttendanceList
                                    sessionData={{
                                        ...activeSession,
                                        _id: activeSession.sessionId || activeSession._id,
                                        course: {
                                            _id: selectedCourse,
                                            name: courses.find(c => c._id === selectedCourse)?.name || 'Course'
                                        },
                                        courseName: activeSession.courseName || courses.find(c => c._id === selectedCourse)?.name || 'Course',
                                        createdAt: activeSession.createdAt || new Date().toISOString()
                                    }}
                                    attendanceData={attendance}
                                    showLiveButton={false}
                                />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* SETUP VIEW */
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel w-full max-w-lg p-8 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-xl"
                    >
                        <div className="text-center mb-8">
                            <div className="bg-gradient-to-br from-sky-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/30">
                                <Play className="text-white fill-white ml-1" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Start New Session</h2>
                            <p className="text-slate-600">Generate a secure QR code for your class</p>
                        </div>

                        <form onSubmit={handleCreateSession} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
                                <select 
                                    className="w-full bg-white/60 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 outline-none transition-all placeholder-slate-500 backdrop-blur-sm"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    required
                                >
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.code} - {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Session Validity (Minutes)
                                </label>
                                <div className="flex items-center gap-4">
                                    <Clock className="text-slate-400" />
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="60" 
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                                    />
                                    <span className="font-bold text-sky-600 min-w-[3rem]">{duration} m</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold py-3 text-lg rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Generating...' : 'Generate QR Code'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default GenerateQR;