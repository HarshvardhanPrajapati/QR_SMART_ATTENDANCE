import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`glass-panel p-6 rounded-xl border border-white/40 bg-white/70 backdrop-blur-md flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
        >
            <div className="bg-gradient-to-br from-sky-500 to-emerald-500 p-4 rounded-xl text-white shadow-lg shadow-sky-500/25">
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-600 text-sm font-medium">{label}</p>
                <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
            </div>
        </motion.div>
    );
};

export default StatCard;