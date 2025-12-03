import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Chart = ({ data }) => {
    return (
        <div className="h-[300px] w-full glass-panel p-4 rounded-xl shadow-sm border border-white/40 bg-white/70 backdrop-blur-md">
            <h3 className="font-bold text-slate-700 mb-4">Attendance Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px -4px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="attendance" fill="url(#skyGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;