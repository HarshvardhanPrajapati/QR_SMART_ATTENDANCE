import React, { useState, useEffect } from 'react';
import { BookOpen, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    const [activeSession, setActiveSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTerminating, setIsTerminating] = useState(false);

    // Check for active session when component mounts
    useEffect(() => {
        const checkActiveSession = async () => {
            setIsLoading(true);
            try {
                const res = await API.get(`/teacher/courses/${course._id}/active-session`);
                if (res.data) {
                    setActiveSession(res.data);
                }
            } catch (error) {
                console.error('Error checking active session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkActiveSession();
    }, [course._id]);

    const handleTerminateSession = async () => {
        if (!activeSession?._id) return;
        
        if (!window.confirm('Are you sure you want to end this session? This cannot be undone.')) {
            return;
        }

        setIsTerminating(true);
        try {
            await API.put(`/teacher/sessions/${activeSession._id}/cancel`);
            setActiveSession(null);
            // Optionally show a success toast
        } catch (error) {
            console.error('Failed to terminate session:', error);
            // Optionally show an error toast
        } finally {
            setIsTerminating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="glass-panel p-6 rounded-xl border border-white/40 bg-white/70 backdrop-blur-md hover:shadow-lg transition-all hover:-translate-y-1">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-xl border border-white/40 bg-white/70 backdrop-blur-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-sky-50 p-3 rounded-lg">
                    <BookOpen className="text-sky-600" size={24} />
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {course.code}
                </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">{course.name}</h3>
            <p className="text-sm text-slate-600 mb-4">{course.department} • Sem {course.semester}</p>
            
            {activeSession && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-emerald-700">
                                Active Session
                            </span>
                        </div>
                        <button
                            onClick={handleTerminateSession}
                            disabled={isTerminating}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                        >
                            {isTerminating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <X size={14} />
                            )}
                            End Session
                        </button>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                        Started: {new Date(activeSession.createdAt).toLocaleTimeString()}
                    </p>
                </div>
            )}
            
            <button 
                onClick={() => navigate(`/teacher/courses/${course._id}`)}
                className="w-full px-3 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-sky-500/25"
            >
                View Reports
            </button>
        </div>
    );
};

export default CourseCard;