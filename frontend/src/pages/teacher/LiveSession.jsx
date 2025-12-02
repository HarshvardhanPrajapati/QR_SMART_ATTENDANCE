import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../../components/common/Navbar';
import QRCodeDisplay from '../../components/teacher/QRCodeDisplay';
import AttendanceList from '../../components/teacher/AttendanceList';
import { ArrowLeft } from 'lucide-react';
import API from '../../services/api';

const SOCKET_URL = 'http://localhost:5000';

const LiveSession = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [sessionInfo, setSessionInfo] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
            <Navbar title="Live Session" />

            <div className="container mx-auto px-4 mt-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading || !sessionInfo ? (
                    <p className="text-slate-500">Loading session...</p>
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


