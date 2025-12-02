import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import { BookOpen, Users, Search, ArrowRight } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
            <Navbar title="Active Courses" />

            <div className="container mx-auto px-4 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Active Courses</h1>
                        <p className="text-slate-500 mt-1">Manage courses and student enrollments</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by course name, code, or department..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Loading courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
                        <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className="text-slate-500">
                            {searchTerm ? 'No courses found matching your search' : 'No courses found. Create a course to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <div
                                key={course._id}
                                onClick={() => navigate(`/admin/courses/${course._id}`)}
                                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer hover:border-blue-500"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                        <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                        {course.code}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">
                                    {course.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    {course.department} • Sem {course.semester} • {course.credits} Credits
                                </p>
                                {course.teacher && (
                                    <p className="text-xs text-slate-400 mb-4">
                                        Teacher: {course.teacher.name}
                                    </p>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500">View Details</span>
                                    <ArrowRight className="text-blue-600" size={20} />
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

