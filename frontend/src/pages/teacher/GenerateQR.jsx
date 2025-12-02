import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import QRCodeDisplay from '../../components/teacher/QRCodeDisplay';
import { motion } from 'framer-motion';
import { Play, Users, Clock, ArrowLeft } from 'lucide-react';

const GenerateQR = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [duration, setDuration] = useState(10); // Default 10 mins 
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);

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
        setLoading(true);
        try {
            const res = await API.post('/teacher/sessions', {
                courseId: selectedCourse,
                timeInMinutes: duration
            });
            
            // Set the session data to display the QR
            setActiveSession({
                ...res.data, // contains qrCode, sessionId, expiresAt
                courseName: courses.find(c => c._id === selectedCourse)?.name
            });
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

    const handleCloseSession = async () => {
        if (!activeSession?.sessionId) {
            setActiveSession(null);
            return;
        }
        try {
            await API.put(`/teacher/sessions/${activeSession.sessionId}/cancel`);
        } catch (error) {
            console.error('Failed to cancel session', error);
        } finally {
            setActiveSession(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
            <Navbar title="Classroom Mode" />

            <div className="container mx-auto px-4 mt-8 flex justify-center">
                {activeSession ? (
                    /* LIVE SESSION VIEW */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-4xl"
                    >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCloseSession} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                        <ArrowLeft size={20} /> End Session
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-green-500 font-bold animate-pulse">● Live Session Active</span>
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: QR Display */}
                            <div className="flex justify-center">
                                <QRCodeDisplay 
                                    qrData={activeSession.qrCode}
                                    expiresAt={activeSession.expiresAt}
                                    courseName={activeSession.courseName}
                                    onFullScreen={() => {}} // Add fullscreen logic if needed
                                />
                            </div>

                            {/* Right: Real-time Stats Placeholder */}
                            <div className="glass-panel p-6 rounded-2xl bg-white/50">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Users className="text-blue-600" /> Live Attendance
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-600 font-medium">Students Marked</p>
                                        <p className="text-3xl font-bold text-blue-800">0</p>
                                        <p className="text-xs text-blue-400 mt-1">Updates automatically</p>
                                    </div>
                                    <div className="text-center text-gray-400 text-sm mt-10">
                                        List of students will appear here...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* SETUP VIEW */
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel w-full max-w-lg p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
                    >
                        <div className="text-center mb-8">
                            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                                <Play className="text-white fill-white ml-1" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Start New Session</h2>
                            <p className="text-slate-500">Generate a secure QR code for your class</p>
                        </div>

                        <form onSubmit={handleCreateSession} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Course</label>
                                <select 
                                    className="input-field bg-slate-50 dark:bg-slate-800 dark:text-white"
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
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="font-bold text-blue-600 min-w-[3rem]">{duration} m</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2"
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