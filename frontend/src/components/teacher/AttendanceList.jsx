import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download } from 'lucide-react';

const AttendanceList = ({ sessionData, attendanceData, showLiveButton = true }) => {
    const navigate = useNavigate();
    
    const exportToCSV = () => {
        // Simple CSV Export Logic
        const headers = ["Name", "Roll Number", "Status", "Time"];
        const rows = attendanceData.map(record => [
            record.student.user.name,
            record.student.rollNumber,
            record.status,
            new Date(record.createdAt).toLocaleTimeString()
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_${sessionData.createdAt}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    if (!sessionData) return <div className="text-gray-500">Select a session to view details.</div>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Session: {new Date(sessionData.createdAt).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {new Date(sessionData.createdAt).toLocaleTimeString()} • {attendanceData.length} Students Present
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showLiveButton && (
                        <button 
                            onClick={() => navigate(`/teacher/sessions/${sessionData._id}/live`)}
                            className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors"
                        >
                            Open Live View
                        </button>
                    )}
                    <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                            <th className="py-3 px-2">Student Name</th>
                            <th className="py-3 px-2">Roll No</th>
                            <th className="py-3 px-2">Time</th>
                            <th className="py-3 px-2">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {attendanceData.length > 0 ? (
                            attendanceData.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-200">
                                        {record.student.user.name}
                                    </td>
                                    <td className="py-3 px-2 text-slate-500">{record.student.rollNumber}</td>
                                    <td className="py-3 px-2 text-slate-500 text-sm font-mono">
                                        {new Date(record.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            <CheckCircle size={12} /> Present
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-slate-400">
                                    No attendance records found for this session.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceList;