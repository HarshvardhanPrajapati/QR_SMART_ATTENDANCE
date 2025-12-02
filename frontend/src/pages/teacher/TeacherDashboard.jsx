// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Navbar from '../../components/common/Navbar';
// import API from '../../services/api';
// import { AuthContext } from '../../context/AuthContext';
// import { Plus, Users, BookOpen, Calendar } from 'lucide-react';

// const TeacherDashboard = () => {
//     const { user } = useContext(AuthContext);
//     const navigate = useNavigate();
//     const [courses, setCourses] = useState([]);
    
//     // Fetch teacher's courses on load
//     useEffect(() => {
//         API.get('/teacher/courses')
//             .then(res => setCourses(res.data))
//             .catch(err => console.error(err));
//     }, []);

//     return (
//         <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
//             <Navbar title="Teacher Portal" />

//             <div className="container mx-auto px-4 mt-8">
                
//                 {/* Header Section */}
//                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//                     <div>
//                         <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
//                         <p className="text-slate-500">Manage your classes and attendance</p>
//                     </div>
//                     <button 
//                         onClick={() => navigate('/teacher/generate-qr')}
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105"
//                     >
//                         <Plus size={20} />
//                         Launch New Class
//                     </button>
//                 </div>

//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                     <StatCard icon={BookOpen} label="Total Courses" value={courses.length} color="bg-purple-500" />
//                     <StatCard icon={Users} label="Total Students" value="--" color="bg-emerald-500" /> {/* Placeholder for now */}
//                     <StatCard icon={Calendar} label="Sessions This Week" value="--" color="bg-orange-500" />
//                 </div>

//                 {/* Courses List */}
//                 <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Your Courses</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {courses.map(course => (
//                         <div key={course._id} className="glass-panel p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 hover:shadow-lg transition-shadow">
//                             <div className="flex justify-between items-start mb-4">
//                                 <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//                                     <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
//                                 </div>
//                                 <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
//                                     {course.code}
//                                 </span>
//                             </div>
//                             <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{course.name}</h3>
//                             <p className="text-sm text-slate-500 mb-4">{course.department} • Sem {course.semester}</p>
                            
//                             <div className="flex gap-2">
//                                 <button 
//                                     onClick={() => navigate(`/teacher/courses/${course._id}`)}
//                                     className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
//                                 >
//                                     View Reports
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
                    
//                     {courses.length === 0 && (
//                         <div className="col-span-full text-center py-10 bg-white/50 border border-dashed border-slate-300 rounded-xl">
//                             <p className="text-slate-500">No courses assigned yet. Contact Admin.</p>
//                         </div>
//                     )}
//                 </div>

//             </div>
//         </div>
//     );
// };

// // Simple Stat Card Component
// const StatCard = ({ icon: Icon, label, value, color }) => (
//     <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
//         <div className={`${color} p-4 rounded-lg text-white shadow-lg shadow-opacity-20`}>
//             <Icon size={24} />
//         </div>
//         <div>
//             <p className="text-slate-500 text-sm font-medium">{label}</p>
//             <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h4>
//         </div>
//     </div>
// );

// export default TeacherDashboard;


import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import CourseCard from '../../components/teacher/CourseCard';
import StatCard from '../../components/shared/StatCard';
import { Plus, Users, BookOpen, Calendar } from 'lucide-react';

const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    
    // Fetch teacher's courses on load
    useEffect(() => {
        API.get('/teacher/courses')
            .then(res => setCourses(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
            <Navbar title="Teacher Portal" />

            <div className="container mx-auto px-4 mt-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
                        <p className="text-slate-500">Manage your classes and attendance</p>
                    </div>
                    <button 
                        onClick={() => navigate('/teacher/generate-qr')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        Launch New Session
                    </button>
                </div>

                {/* Stats Grid using Shared Component */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={BookOpen} label="Total Courses" value={courses.length} color="bg-purple-500" />
                    <StatCard icon={Users} label="Total Students" value="--" color="bg-emerald-500" />
                    <StatCard icon={Calendar} label="Sessions This Week" value="--" color="bg-orange-500" />
                </div>

                {/* Courses List using Component */}
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Your Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                    
                    {courses.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-white/50 border border-dashed border-slate-300 rounded-xl">
                            <p className="text-slate-500">No courses assigned yet. Contact Admin.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TeacherDashboard;