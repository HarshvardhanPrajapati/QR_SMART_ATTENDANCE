// import React, { useState, useEffect } from 'react';
// import Navbar from '../../components/common/Navbar';
// import API from '../../services/api';
// import AddUserForm from '../../components/admin/AddUserForm';
// import AddCourseForm from '../../components/admin/AddCourseForm';
// import { Users, BookOpen, BarChart3, PlusCircle, X } from 'lucide-react';
// import { motion } from 'framer-motion';

// const AdminDashboard = () => {
//     const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, totalAttendanceLogs: 0 });
//     const [activeModal, setActiveModal] = useState(null); // 'user' or 'course' or null

//     useEffect(() => {
//         fetchStats();
//     }, []);

//     const fetchStats = async () => {
//         try {
//             const res = await API.get('/admin/stats');
//             setStats(res.data);
//         } catch (error) {
//             console.error("Error fetching stats:", error);
//         }
//     };

//     const closeModal = () => {
//         setActiveModal(null);
//         fetchStats(); // Refresh stats after adding something
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
//             <Navbar title="Administrator Portal" />

//             <div className="container mx-auto px-4 mt-8">
//                 <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">System Overview</h1>

//                 {/* Statistics Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
//                     <StatCard icon={Users} label="Total Students" value={stats.students} color="bg-blue-500" />
//                     <StatCard icon={Users} label="Total Teachers" value={stats.teachers} color="bg-indigo-500" />
//                     <StatCard icon={BookOpen} label="Active Courses" value={stats.courses} color="bg-purple-500" />
//                     <StatCard icon={BarChart3} label="Attendance Logs" value={stats.totalAttendanceLogs} color="bg-emerald-500" />
//                 </div>

//                 {/* Quick Actions */}
//                 <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quick Management</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <ActionCard 
//                         title="Register New User" 
//                         desc="Create accounts for Students or Teachers." 
//                         onClick={() => setActiveModal('user')}
//                         color="from-blue-600 to-blue-400"
//                     />
//                     <ActionCard 
//                         title="Create New Course" 
//                         desc="Set up a course and assign a teacher." 
//                         onClick={() => setActiveModal('course')}
//                         color="from-purple-600 to-purple-400"
//                     />
//                 </div>
//             </div>

//             {/* Modal Overlay */}
//             {activeModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//                     <motion.div 
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
//                     >
//                         <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
//                             <h3 className="text-lg font-bold text-slate-800 dark:text-white">
//                                 {activeModal === 'user' ? 'Add New User' : 'Create New Course'}
//                             </h3>
//                             <button onClick={closeModal} className="p-2 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors">
//                                 <X size={20} />
//                             </button>
//                         </div>
                        
//                         <div className="p-6 max-h-[80vh] overflow-y-auto">
//                             {activeModal === 'user' && <AddUserForm onSuccess={closeModal} />}
//                             {activeModal === 'course' && <AddCourseForm onSuccess={closeModal} />}
//                         </div>
//                     </motion.div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // Helper Components
// const StatCard = ({ icon: Icon, label, value, color }) => (
//     <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
//         <div className={`${color} p-3 rounded-lg text-white shadow-md`}>
//             <Icon size={24} />
//         </div>
//         <div>
//             <p className="text-slate-500 text-sm">{label}</p>
//             <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h4>
//         </div>
//     </div>
// );

// const ActionCard = ({ title, desc, onClick, color }) => (
//     <button 
//         onClick={onClick}
//         className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all hover:shadow-xl hover:scale-[1.01]`}
//     >
//         <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90`}></div>
//         <div className="relative z-10 text-white">
//             <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
//                 <PlusCircle /> {title}
//             </h3>
//             <p className="text-white/80">{desc}</p>
//         </div>
//         {/* Decorative Circle */}
//         <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
//     </button>
// );

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import AddUserForm from '../../components/admin/AddUserForm';
import AddCourseForm from '../../components/admin/AddCourseForm';
import StatCard from '../../components/shared/StatCard';
import Modal from '../../components/shared/Modal';
import { Users, BookOpen, BarChart3, PlusCircle, List } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, totalAttendanceLogs: 0 });
    const [activeModal, setActiveModal] = useState(null); // 'user' or 'course' or null

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        fetchStats(); // Refresh stats after adding something
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
            <Navbar title="Administrator Portal" />

            <div className="container mx-auto px-4 mt-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">System Overview</h1>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard icon={Users} label="Total Students" value={stats.students} color="bg-blue-500" />
                    <StatCard icon={Users} label="Total Teachers" value={stats.teachers} color="bg-indigo-500" />
                    <StatCard icon={BookOpen} label="Active Courses" value={stats.courses} color="bg-purple-500" />
                    <StatCard icon={BarChart3} label="Attendance Logs" value={stats.totalAttendanceLogs} color="bg-emerald-500" />
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quick Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ActionCard 
                        title="Register New User" 
                        desc="Create accounts for Students or Teachers." 
                        onClick={() => setActiveModal('user')}
                        color="from-blue-600 to-blue-400"
                    />
                    <ActionCard 
                        title="Create New Course" 
                        desc="Set up a course and assign a teacher." 
                        onClick={() => setActiveModal('course')}
                        color="from-purple-600 to-purple-400"
                    />
                    <ActionCard 
                        title="Active Courses" 
                        desc="View all courses and manage student enrollments." 
                        onClick={() => navigate('/admin/courses')}
                        color="from-emerald-600 to-emerald-400"
                        icon={List}
                    />
                </div>
            </div>

            {/* Reusable Modal */}
            <Modal 
                isOpen={!!activeModal} 
                onClose={closeModal} 
                title={activeModal === 'user' ? 'Add New User' : 'Create New Course'}
            >
                {activeModal === 'user' && <AddUserForm onSuccess={closeModal} />}
                {activeModal === 'course' && <AddCourseForm onSuccess={closeModal} />}
            </Modal>
        </div>
    );
};

// Helper Component for Actions (kept local as it wasn't requested to be shared)
const ActionCard = ({ title, desc, onClick, color, icon: Icon = PlusCircle }) => (
    <button 
        onClick={onClick}
        className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all hover:shadow-xl hover:scale-[1.01]`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90`}></div>
        <div className="relative z-10 text-white">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Icon /> {title}
            </h3>
            <p className="text-white/80">{desc}</p>
        </div>
        {/* Decorative Circle */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
    </button>
);

export default AdminDashboard;