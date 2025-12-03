import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const SessionCard = ({ session, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all border ${
                isSelected
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border-sky-500'
                : 'glass-panel bg-white/70 hover:bg-white/80 text-slate-700 border-white/40'
            }`}
        >
            <div className={`p-2 rounded-lg ${isSelected ? 'bg-sky-600' : 'bg-slate-100'}`}>
                <Calendar size={18} />
            </div>
            <div>
                <p className="font-semibold text-sm">
                    {new Date(session.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                    <Clock size={12} />
                    {new Date(session.createdAt).toLocaleTimeString()}
                </div>
            </div>
        </button>
    );
};

export default SessionCard;