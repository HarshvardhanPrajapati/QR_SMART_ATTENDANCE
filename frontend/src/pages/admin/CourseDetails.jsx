import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import { ArrowLeft, UserPlus, CheckCircle, XCircle, User, Trash2 } from 'lucide-react';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [studentRollNumber, setStudentRollNumber] = useState('');
    const [studentDetails, setStudentDetails] = useState(null);
    const [searchingStudent, setSearchingStudent] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/admin/courses/${courseId}`);
            setCourse(res.data.course);
            setEnrollments(res.data.enrollments || []);
        } catch (error) {
            console.error('Error fetching course details:', error);
            alert('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchStudent = async () => {
        if (!studentRollNumber.trim()) {
            setError('Please enter a student roll number');
            return;
        }

        try {
            setSearchingStudent(true);
            setError('');
            setStudentDetails(null);
            const res = await API.get(`/admin/students/${studentRollNumber.trim()}`);
            setStudentDetails(res.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Student not found');
            setStudentDetails(null);
        } finally {
            setSearchingStudent(false);
        }
    };

    const handleEnrollStudent = async () => {
        if (!studentDetails) return;

        try {
            setEnrolling(true);
            setError('');
            await API.post(`/admin/courses/${courseId}/enroll`, {
                studentId: studentDetails._id
            });
            alert('Student enrolled successfully!');
            setShowEnrollModal(false);
            setStudentRollNumber('');
            setStudentDetails(null);
            setError('');
            fetchCourseDetails(); // Refresh the list
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to enroll student');
        } finally {
            setEnrolling(false);
        }
    };

    const handleCloseModal = () => {
        setShowEnrollModal(false);
        setStudentRollNumber('');
        setStudentDetails(null);
        setError('');
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('Are you sure you want to delete this course? This will also delete all enrollments, sessions, and attendance records associated with it. This action cannot be undone.')) {
            return;
        }

        try {
            await API.delete(`/admin/courses/${courseId}`);
            alert('Course deleted successfully');
            navigate('/admin/manage-courses');
        } catch (error) {
            console.error('Error deleting course:', error);
            alert(error.response?.data?.message || 'Failed to delete course');
        }
    };

    const handleUnenrollStudent = async (enrollmentId) => {
        if (!enrollmentId) return;
        
        if (!window.confirm('Are you sure you want to remove this student from this course? Their account and other course enrollments will be kept.')) {
            return;
        }

        try {
            await API.delete(`/admin/courses/${courseId}/enrollments/${enrollmentId}`);
            alert('Student removed from course successfully');
            fetchCourseDetails(); // Refresh the list
        } catch (error) {
            console.error('Error unenrolling student from course:', error);
            alert(error.response?.data?.message || 'Failed to remove student from course');
        }
    };

    const handleDeleteTeacher = async (teacherUserId) => {
        if (!teacherUserId) return;
        
        if (!window.confirm('Are you sure you want to delete this teacher? This will also delete all their courses, sessions, and related data. This action cannot be undone.')) {
            return;
        }

        try {
            // First, we need to get the Teacher model ID from the User ID
            // The backend will handle finding the teacher by user ID
            await API.delete(`/admin/teachers/${teacherUserId}`);
            alert('Teacher deleted successfully');
            navigate('/admin/manage-courses');
        } catch (error) {
            console.error('Error deleting teacher:', error);
            alert(error.response?.data?.message || 'Failed to delete teacher');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Navbar title="Course Details" />
                <div className="container mx-auto px-4 mt-8">
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Navbar title="Course Details" />
                <div className="container mx-auto px-4 mt-8">
                    <p className="text-red-500">Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 pb-10">
            <Navbar title="Course Details" />

            <div className="container mx-auto px-4 mt-8">
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Courses
                </button>

                {/* Course Info Card */}
                <div className="glass-panel rounded-xl p-6 mb-6 border border-white/40 bg-white/70 backdrop-blur-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold bg-sky-100 text-sky-600 px-3 py-1 rounded">
                                    {course.code}
                                </span>
                                <span className="text-sm text-slate-600">
                                    {course.department} • Sem {course.semester}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {course.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                <span><strong>Credits:</strong> {course.credits}</span>
                                {course.teacher && (
                                    <span className="flex items-center gap-2">
                                        <strong>Teacher:</strong> {course.teacher.name}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // course.teacher is the User object, we need to find the Teacher by user ID
                                                // For now, pass the user ID and let backend find the teacher
                                                handleDeleteTeacher(course.teacher?._id || course.teacher);
                                            }}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                                            title="Delete teacher"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowEnrollModal(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-sky-500/25"
                            >
                                <UserPlus size={20} />
                                Register Student
                            </button>
                            <button
                                onClick={handleDeleteCourse}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Trash2 size={20} />
                                Delete Course
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enrolled Students List */}
                <div className="glass-panel rounded-xl p-6 border border-white/40 bg-white/70 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Enrolled Students ({enrollments.length})
                    </h2>
                    {enrollments.length === 0 ? (
                        <div className="text-center py-12 glass-panel border border-white/40 bg-white/70 backdrop-blur-md rounded-xl">
                            <User className="mx-auto text-slate-400 mb-4" size={48} />
                            <p className="text-slate-600">No students enrolled yet</p>
                            <button
                                onClick={() => setShowEnrollModal(true)}
                                className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                            >
                                Register the first student
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/60 border-b border-slate-200/60">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Roll Number</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Name</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Email</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Department</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Semester</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Enrolled Date</th>
                                        <th className="p-4 text-sm font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/60">
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment._id} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="p-4 font-medium text-slate-900">
                                                {enrollment.student?.rollNumber}
                                            </td>
                                            <td className="p-4 text-slate-700">
                                                {enrollment.student?.user?.name}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {enrollment.student?.user?.email}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {enrollment.student?.department}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {enrollment.student?.semester}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUnenrollStudent(enrollment._id);
                                                    }}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                    title="Remove from this course"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Enroll Student Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/40 bg-white/70 backdrop-blur-md">
                        <div className="p-6 border-b border-slate-200/60">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">
                                    Register Student
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Student Roll Number
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 input-field"
                                        placeholder="Enter roll number (e.g., 2021CS001)"
                                        value={studentRollNumber}
                                        onChange={(e) => {
                                            setStudentRollNumber(e.target.value);
                                            setError('');
                                            setStudentDetails(null);
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchStudent();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleSearchStudent}
                                        disabled={searchingStudent || !studentRollNumber.trim()}
                                        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/25"
                                    >
                                        {searchingStudent ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            {studentDetails && (
                                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="text-green-600 dark:text-green-400 mt-1" size={20} />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                                Student Found
                                            </h4>
                                            <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                                <p><strong>Name:</strong> {studentDetails.user?.name}</p>
                                                <p><strong>Roll Number:</strong> {studentDetails.rollNumber}</p>
                                                <p><strong>Email:</strong> {studentDetails.user?.email}</p>
                                                <p><strong>Department:</strong> {studentDetails.department}</p>
                                                <p><strong>Semester:</strong> {studentDetails.semester}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEnrollStudent}
                                    disabled={!studentDetails || enrolling}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/25"
                                >
                                    {enrolling ? 'Adding...' : 'Add Student'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;

