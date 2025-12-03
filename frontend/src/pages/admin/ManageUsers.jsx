import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import API from '../../services/api';
import { Users, Search } from 'lucide-react';

const ManageUsers = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const initialType = params.get('type') === 'teachers' ? 'teachers' : 'students';

    const [viewType, setViewType] = useState(initialType); // 'students' | 'teachers'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData(viewType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewType]);

    const fetchData = async (type) => {
        try {
            setLoading(true);
            setError('');
            const endpoint = type === 'teachers' ? '/admin/teachers' : '/admin/students';
            const res = await API.get(endpoint);
            setItems(res.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Failed to load data');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter((item) => {
        const name = item.user?.name || '';
        const email = item.user?.email || '';
        const roll = item.rollNumber || '';
        const dept = item.department || '';
        const term = searchTerm.toLowerCase();
        return (
            name.toLowerCase().includes(term) ||
            email.toLowerCase().includes(term) ||
            roll.toLowerCase().includes(term) ||
            dept.toLowerCase().includes(term)
        );
    });

    const isStudents = viewType === 'students';

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 pb-10">
            <Navbar title={isStudents ? 'All Students' : 'All Teachers'} />

            <div className="container mx-auto px-4 mt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Users /> {isStudents ? 'Students' : 'Teachers'}
                        </h1>
                        <p className="text-slate-600 mt-1">
                            {isStudents
                                ? 'View all registered students with their roll numbers and departments.'
                                : 'View all registered teachers.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/60 border border-slate-200 hover:bg-white/80 transition-all mb-2 md:mb-0 backdrop-blur-sm"
                        >
                            Back to Dashboard
                        </button>
                        <div className="flex gap-2 glass-panel rounded-xl border border-white/40 bg-white/70 backdrop-blur-md p-1">
                        <button
                            onClick={() => setViewType('students')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isStudents
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setViewType('teachers')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !isStudents
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Teachers
                        </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder={
                                isStudents
                                    ? 'Search by name, roll number, email, or department...'
                                    : 'Search by name or email...'
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/60 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all placeholder-slate-500 backdrop-blur-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-600">
                            Loading {isStudents ? 'students' : 'teachers'}...
                        </p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 glass-panel border border-white/40 bg-white/70 backdrop-blur-md rounded-xl">
                        <p className="text-slate-600">
                            No {isStudents ? 'students' : 'teachers'} found.
                        </p>
                    </div>
                ) : (
                    <div className="glass-panel rounded-xl border border-white/40 bg-white/70 backdrop-blur-md overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/60 border-b border-slate-200/60">
                                <tr>
                                    {isStudents && (
                                        <>
                                            <th className="p-4 text-sm font-semibold text-slate-700">
                                                Roll No
                                            </th>
                                            <th className="p-4 text-sm font-semibold text-slate-700">
                                                Name
                                            </th>
                                            <th className="p-4 text-sm font-semibold text-slate-700">
                                                Branch
                                            </th>
                                            <th className="p-4 text-sm font-semibold text-slate-700">
                                                Semester
                                            </th>
                                            <th className="p-4 text-sm font-semibold text-slate-700">
                                                Email
                                            </th>
                                        </>
                                    )}
                                    {!isStudents && (
                                        <>
                                            <th className="p-4 text-sm font-semibold text-slate-700">
                                                Name
                                            </th>
                                            <th className="p-4 text-sm font-semibold text-slate-700">
                                                Email
                                            </th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60">
                                {filteredItems.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-slate-50/40 transition-colors"
                                    >
                                        {isStudents && (
                                            <>
                                                <td className="p-4 font-medium text-slate-900">
                                                    {item.rollNumber}
                                                </td>
                                                <td className="p-4 text-slate-700">
                                                    {item.user?.name}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {item.department}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {item.semester}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {item.user?.email}
                                                </td>
                                            </>
                                        )}
                                        {!isStudents && (
                                            <>
                                                <td className="p-4 font-medium text-slate-900">
                                                    {item.user?.name}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {item.user?.email}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;