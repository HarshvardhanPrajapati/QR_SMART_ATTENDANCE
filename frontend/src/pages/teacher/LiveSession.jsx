import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../../components/common/Navbar';
import QRCodeDisplay from '../../components/teacher/QRCodeDisplay';
import AttendanceList from '../../components/teacher/AttendanceList';
import { ArrowLeft, X, Loader2 } from 'lucide-react';
import API from '../../services/api';

const SOCKET_URL = 'http://localhost:5000';

const LiveSession = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [sessionInfo, setSessionInfo] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTerminating, setIsTerminating] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [sessionRes, attendanceRes] = await Promise.all([
                    API.get(`/teacher/sessions/${sessionId}/details`),
                    API.get(`/teacher/sessions/${sessionId}/attendance`),
                ]);

                setSessionInfo(sessionRes.data);
                setAttendance(attendanceRes.data || []);
            } catch (err) {
                console.error('Error loading live session data', err);
                setError('Failed to load live session. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [sessionId]);

    useEffect(() => {
        // Socket.io realtime updates
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            socket.emit('joinSession', sessionId);
        });

        socket.on('attendance:marked', (payload) => {
            if (payload.sessionId === sessionId) {
                setAttendance((prev) => [...prev, payload.attendance]);
            }
        });

        // Fallback polling every 5 seconds in case sockets fail
        const interval = setInterval(async () => {
            try {
                const res = await API.get(`/teacher/sessions/${sessionId}/attendance`);
                setAttendance(res.data || []);
            } catch (err) {
                console.error('Polling attendance failed', err);
            }
        }, 5000);

        return () => {
            socket.emit('leaveSession', sessionId);
            socket.disconnect();
            clearInterval(interval);
        };
    }, [sessionId]);

    const handleTerminateSession = async () => {
        if (!window.confirm('Are you sure you want to end this session? This will prevent any further attendance marking.')) {
            return;
        }

        setIsTerminating(true);
        try {
            await API.put(`/teacher/sessions/${sessionId}/cancel`);
            // Optionally navigate away or show success message
            navigate('/teacher/dashboard');
        } catch (error) {
            console.error('Failed to terminate session:', error);
            setError('Failed to terminate session. Please try again.');
        } finally {
            setIsTerminating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 pb-10">
            <Navbar title="Live Session" />

            <div className="container mx-auto px-4 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} /> Back
                    </button>
                    <button
                        onClick={handleTerminateSession}
                        disabled={isTerminating}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
                    >
                        {isTerminating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ending...
                            </>
                        ) : (
                            <>
                                <X size={18} />
                                End Session
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-2 text-sm text-red-700 backdrop-blur-sm">
                        {error}
                    </div>
                )}

                {loading || !sessionInfo ? (
                    <p className="text-slate-600">Loading session...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: QR Display */}
                        <div className="flex justify-center">
                            <QRCodeDisplay
                                qrData={sessionInfo.qrCode}
                                expiresAt={sessionInfo.expiresAt}
                                courseName={sessionInfo.courseName}
                                onFullScreen={() => {}}
                            />
                        </div>

                        {/* Right: Live Attendance List */}
                        <div className="md:col-span-1">
                            <AttendanceList
                                sessionData={sessionInfo}
                                attendanceData={attendance}
                                showLiveButton={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveSession;


