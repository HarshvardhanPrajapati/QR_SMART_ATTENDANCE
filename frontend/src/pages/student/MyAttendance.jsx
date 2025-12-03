import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import { getMyAttendance, getMyCourses } from '../../services/studentService';
import { formatDateTime, formatDate } from '../../utils/helpers';
import { Calendar, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    courseId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, coursesRes] = await Promise.all([
        getMyAttendance(),
        getMyCourses(),
      ]);

      setAttendance(attendanceRes.data.attendance || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      toast.error('Failed to load attendance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await getMyAttendance(filters);
      setAttendance(response.data.attendance || []);
      toast.success('Filters applied');
    } catch (error) {
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      courseId: '',
      startDate: '',
      endDate: '',
    });
    fetchData();
  };

  const exportToCSV = () => {
    if (attendance.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Date', 'Course Code', 'Course Name', 'Status', 'Time'];
    const rows = attendance.map((record) => [
      formatDate(record.session?.sessionDate),
      record.course?.courseCode,
      record.course?.courseName,
      record.status,
      formatDateTime(record.markedAt),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Attendance exported successfully');
  };

  if (loading) {
    return <Loading fullScreen text="Loading attendance..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">My Attendance</h1>
            <p className="text-slate-600 mt-1">
              View your attendance history and statistics
            </p>
          </div>

          {/* Filters */}
          <div className="glass-panel mb-6 border border-white/40 bg-white/70 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Filter size={20} className="mr-2 text-sky-500" />
                Filters
              </h2>
              <button onClick={exportToCSV} className="glass-panel px-4 py-2 rounded-xl font-medium flex items-center space-x-2 border border-white/40 bg-white/70 backdrop-blur-md hover:bg-white/80 transition-all">
                <Download size={18} className="text-slate-600" />
                <span className="text-slate-700">Export CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course
                </label>
                <select
                  name="courseId"
                  value={filters.courseId}
                  onChange={handleFilterChange}
                  className="w-full bg-white/60 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 outline-none transition-all placeholder-slate-500 backdrop-blur-sm"
                >
                  <option value="">All Courses</option>
                  {courses.map((enrollment) => (
                    <option key={enrollment._id} value={enrollment.course?._id}>
                      {enrollment.course?.courseCode} -{' '}
                      {enrollment.course?.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full bg-white/60 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 outline-none transition-all placeholder-slate-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full bg-white/60 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 outline-none transition-all placeholder-slate-500 backdrop-blur-sm"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button onClick={applyFilters} className="flex-1 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/25">
                  Apply
                </button>
                <button onClick={clearFilters} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-all">
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="glass-panel border border-white/40 bg-white/70 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Attendance Records ({attendance.length})
            </h2>

            {attendance.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white/40 backdrop-blur-sm">
                <table className="w-full">
                  <thead className="bg-slate-50/60 border-b border-slate-200/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Course</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Marked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {attendance.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-slate-900">{formatDate(record.session?.sessionDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {record.course?.courseCode}
                            </p>
                            <p className="text-sm text-slate-600">
                              {record.course?.courseName}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : record.status === 'late'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDateTime(record.markedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={64} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No attendance records found</p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MyAttendance;