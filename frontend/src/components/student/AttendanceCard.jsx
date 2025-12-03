import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendanceCard = ({ record }) => {
    const isPresent = record.status === 'Present';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-4 rounded-xl shadow-sm border border-white/40 bg-white/70 backdrop-blur-md flex justify-between items-center hover:shadow-lg transition-all"
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${isPresent ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    <Calendar size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">{record.course?.name || 'Unknown Course'}</h4>
                    <p className="text-sm text-slate-600">
                        {new Date(record.createdAt).toLocaleDateString()} • {new Date(record.createdAt).toLocaleTimeString()}
                    </p>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                isPresent 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            }`}>
                {isPresent ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {record.status}
            </div>
        </motion.div>
    );
};

export default AttendanceCard;