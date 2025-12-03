import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { getMyCourses, getAttendanceStats } from '../../services/studentService';
import { BookOpen, User, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStats, setCourseStats] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const viewCourseDetails = async (courseId) => {
    try {
      const response = await getAttendanceStats(courseId);
      setCourseStats(response.data);
      setSelectedCourse(courseId);
    } catch (error) {
      toast.error('Failed to load course statistics');
      console.error(error);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading courses..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">My Courses</h1>
            <p className="text-slate-600 mt-1">
              View your enrolled courses and attendance statistics
            </p>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="glass-panel hover:shadow-xl transition-all cursor-pointer border border-white/40 bg-white/70 backdrop-blur-md"
                  onClick={() => viewCourseDetails(enrollment.course?._id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="text-sky-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {enrollment.course?.courseCode}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {enrollment.course?.semester} Semester
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 mb-3">
                    {enrollment.course?.courseName}
                  </h4>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <User size={16} className="mr-2 text-slate-400" />
                      <span>{enrollment.course?.teacher?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar size={16} className="mr-2 text-slate-400" />
                      <span>
                        {enrollment.classesAttended}/{enrollment.totalClassesHeld}{' '}
                        classes
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Attendance
                      </span>
                      <div className="flex items-center space-x-2">
                        <TrendingUp
                          size={16}
                          className={
                            enrollment.attendancePercentage >= 75
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }
                        />
                        <span
                          className={`text-xl font-bold ${
                            enrollment.attendancePercentage >= 75
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {enrollment.attendancePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          enrollment.attendancePercentage >= 75
                            ? 'bg-emerald-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${enrollment.attendancePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span
                    className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      enrollment.attendancePercentage >= 75
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {enrollment.attendancePercentage >= 75
                      ? 'Good Standing'
                      : 'Low Attendance'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
        <div className="glass-panel text-center py-12 border border-white/40 bg-white/70 backdrop-blur-md">
          <BookOpen size={64} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Courses Enrolled
          </h3>
          <p className="text-slate-600">
            You are not enrolled in any courses yet.
          </p>
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && courseStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => setSelectedCourse(null)}>
          <div
            className="bg-white/70 backdrop-blur-md w-full max-w-2xl rounded-2xl shadow-2xl border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200/60 bg-white/80">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                {courseStats.courseDetails?.courseName}
              </h2>
              <p className="text-slate-600 mt-1">
                {courseStats.courseDetails?.courseCode}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-100/60">
                  <p className="text-sm text-slate-600">Total Classes</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {courseStats.totalClasses}
                  </p>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100/60">
                  <p className="text-sm text-slate-600">Attended</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {courseStats.classesAttended}
                  </p>
                </div>
                <div className="bg-red-50/60 rounded-xl p-4 border border-red-100/60">
                  <p className="text-sm text-slate-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {courseStats.classesAbsent}
                  </p>
                </div>
                <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-100/60">
                  <p className="text-sm text-slate-600">Percentage</p>
                  <p
                    className={`text-2xl font-bold ${
                      courseStats.attendancePercentage >= 75
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {courseStats.attendancePercentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">
                  Recent Attendance
                </h3>
                {courseStats.recentAttendance &&
                courseStats.recentAttendance.length > 0 ? (
                  <div className="space-y-2">
                    {courseStats.recentAttendance.map((record) => (
                      <div
                        key={record._id}
                        className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-200/60"
                      >
                        <span className="text-sm text-slate-700">
                          {new Date(
                            record.session?.sessionDate
                          ).toLocaleDateString()}
                        </span>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Present</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    No recent attendance
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="w-full mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  </div>
  <Footer />
</div>
);
};
export default MyCourses;