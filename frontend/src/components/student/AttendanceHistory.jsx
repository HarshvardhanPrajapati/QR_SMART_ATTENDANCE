import React from 'react';
import AttendanceCard from './AttendanceCard';

const AttendanceHistory = ({ history, loading }) => {
    if (loading) return <div className="text-slate-500 text-center py-4">Loading records...</div>;
    
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-10 glass-panel border border-white/40 bg-white/70 backdrop-blur-md rounded-xl">
                <p className="text-slate-600">No attendance records found yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {history.map((record) => (
                <AttendanceCard key={record._id} record={record} />
            ))}
        </div>
    );
};

export default AttendanceHistory;