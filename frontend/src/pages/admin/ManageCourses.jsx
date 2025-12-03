import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import { BookOpen, Users, Search, ArrowRight, ArrowLeft } from 'lucide-react';

const ManageCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await API.get('/admin/courses');
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            alert('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 pb-10">
            <Navbar title="Active Courses" />

            <div className="container mx-auto px-4 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">Active Courses</h1>
                        <p className="text-slate-600 mt-1">Manage courses and student enrollments</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/60 border border-slate-200 hover:bg-white/80 transition-all backdrop-blur-sm"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by course name, code, or department..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/60 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all placeholder-slate-500 backdrop-blur-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-600">Loading courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12 glass-panel border border-white/40 bg-white/70 backdrop-blur-md rounded-xl">
                        <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-600">
                            {searchTerm ? 'No courses found matching your search' : 'No courses found. Create a course to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <div
                                key={course._id}
                                onClick={() => navigate(`/admin/courses/${course._id}`)}
                                className="glass-panel rounded-xl p-6 border border-white/40 bg-white/70 backdrop-blur-md hover:shadow-lg transition-all cursor-pointer hover:border-sky-500"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-sky-50 p-3 rounded-lg">
                                        <BookOpen className="text-sky-600" size={24} />
                                    </div>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                        {course.code}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">
                                    {course.name}
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    {course.department} • Sem {course.semester} • {course.credits} Credits
                                </p>
                                {course.teacher && (
                                    <p className="text-xs text-slate-400 mb-4">
                                        Teacher: {course.teacher.name}
                                    </p>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                                    <span className="text-sm text-slate-600">View Details</span>
                                    <ArrowRight className="text-sky-600" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCourses;


