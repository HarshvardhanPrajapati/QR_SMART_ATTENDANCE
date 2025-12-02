// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import Navbar from '../../components/common/Navbar';
// import API from '../../services/api';
// import AttendanceList from '../../components/teacher/AttendanceList';
// import { ArrowLeft, Calendar } from 'lucide-react';

// const ViewAttendance = () => {
//     const { courseId } = useParams();
//     const navigate = useNavigate();
    
//     const [sessions, setSessions] = useState([]);
//     const [selectedSession, setSelectedSession] = useState(null);
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [courseInfo, setCourseInfo] = useState(null);

//     // 1. Load Sessions for this Course
//     useEffect(() => {
//         // We need a backend endpoint to get sessions by course
//         // Assuming GET /api/teacher/courses/:id/sessions exists or we filter client side
//         // For now, let's fetch course details and mock session fetching or add the route
//         const fetchData = async () => {
//             try {
//                 // Fetch Course Info (You might need to add a generic GET /courses/:id endpoint)
//                 // Using existing endpoint logic:
//                 const res = await API.get('/teacher/courses'); 
//                 const course = res.data.find(c => c._id === courseId);
//                 setCourseInfo(course);

//                 // Fetch Sessions (We need to add this endpoint to backend or use a query)
//                 // Since I gave you getSessionAttendance, let's assume we have a way to list sessions
//                 // For this demo, let's assume we fetch all sessions for the teacher and filter
//                 // Ideally: API.get(`/teacher/courses/${courseId}/sessions`)
                
//                 // MOCKING Session Data for display purposes since we didn't explicitly create a "List Sessions" API
//                 setSessions([
//                     { _id: '1', createdAt: new Date().toISOString() },
//                     { _id: '2', createdAt: new Date(Date.now() - 86400000).toISOString() }
//                 ]);
//             } catch (err) {
//                 console.error("Error loading data", err);
//             }
//         };
//         fetchData();
//     }, [courseId]);

//     // 2. Load Attendance when a session is clicked
//     const handleSessionClick = async (session) => {
//         setSelectedSession(session);
//         try {
//             // This endpoint WAS provided in the backend code I gave you
//             const res = await API.get(`/teacher/sessions/${session._id}/attendance`);
//             setAttendanceData(res.data);
//         } catch (error) {
//             console.error("Error fetching attendance list", error);
//             // Fallback for demo if backend is empty
//             setAttendanceData([]); 
//         }
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
//             <Navbar title="Attendance Report" />

//             <div className="container mx-auto px-4 mt-8">
//                 <button 
//                     onClick={() => navigate('/teacher/dashboard')}
//                     className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
//                 >
//                     <ArrowLeft size={20} /> Back to Dashboard
//                 </button>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
//                     {/* Left: Session List */}
//                     <div className="md:col-span-1 space-y-4">
//                         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200">
//                             <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">
//                                 {courseInfo?.name || 'Course'} History
//                             </h2>
//                             <div className="space-y-2">
//                                 {sessions.map((session) => (
//                                     <button
//                                         key={session._id}
//                                         onClick={() => handleSessionClick(session)}
//                                         className={`w-full text-left p-4 rounded-lg flex items-center gap-3 transition-all ${
//                                             selectedSession?._id === session._id
//                                             ? 'bg-blue-600 text-white shadow-md'
//                                             : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
//                                         }`}
//                                     >
//                                         <Calendar size={18} />
//                                         <div>
//                                             <p className="font-semibold text-sm">
//                                                 {new Date(session.createdAt).toLocaleDateString()}
//                                             </p>
//                                             <p className="text-xs opacity-80">
//                                                 {new Date(session.createdAt).toLocaleTimeString()}
//                                             </p>
//                                         </div>
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right: Detailed List */}
//                     <div className="md:col-span-2">
//                         <AttendanceList 
//                             sessionData={selectedSession} 
//                             attendanceData={attendanceData} 
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ViewAttendance;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import AttendanceList from '../../components/teacher/AttendanceList';
import SessionCard from '../../components/teacher/SessionCard';
import { ArrowLeft } from 'lucide-react';

const ViewAttendance = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [courseInfo, setCourseInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    

    // 1. Load Sessions for this Course
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all teacher courses and derive this course's info
                const coursesRes = await API.get('/teacher/courses');
                const course = coursesRes.data.find(c => c._id === courseId);
                setCourseInfo(course || null);

                // Fetch real sessions for this course
                const sessionsRes = await API.get(`/teacher/courses/${courseId}/sessions`);
                setSessions(sessionsRes.data || []);

                // Optionally auto-select the most recent session
                if (sessionsRes.data && sessionsRes.data.length > 0) {
                    setSelectedSession(sessionsRes.data[0]);

                    // Preload attendance for the latest session
                    try {
                        const attendanceRes = await API.get(`/teacher/sessions/${sessionsRes.data[0]._id}/attendance`);
                        setAttendanceData(attendanceRes.data || []);
                    } catch (attendanceErr) {
                        console.error('Error preloading attendance', attendanceErr);
                        setAttendanceData([]);
                    }
                } else {
                    setSelectedSession(null);
                    setAttendanceData([]);
                }
            } catch (err) {
                console.error("Error loading data", err);
                setError('Failed to load sessions. Please try again later.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    // 2. Load Attendance when a session is clicked
    const handleSessionClick = async (session) => {
        setSelectedSession(session);
        try {
            const res = await API.get(`/teacher/sessions/${session._id}/attendance`);
            setAttendanceData(res.data);
        } catch (error) {
            console.error("Error fetching attendance list", error);
            setAttendanceData([]); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
            <Navbar title="Attendance Report" />

            <div className="container mx-auto px-4 mt-8">
                <button 
                    onClick={() => navigate('/teacher/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left: Session List using Component */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">
                                {courseInfo?.name || 'Course'} History
                            </h2>
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading sessions...</p>
                            ) : sessions.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No sessions found yet for this course.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                    {sessions.map((session) => (
                                        <SessionCard 
                                            key={session._id} 
                                            session={session} 
                                            isSelected={selectedSession?._id === session._id}
                                            onClick={() => handleSessionClick(session)} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Detailed List */}
                    <div className="md:col-span-2">
                        <AttendanceList 
                            sessionData={selectedSession} 
                            attendanceData={attendanceData} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAttendance;