import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, QrCode } from 'lucide-react';

const Navbar = ({ title }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-panel sticky top-4 z-50 mx-6 flex items-center justify-between px-7 py-4">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/25">
                    <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                    {title || 'Smart Attendance'}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-3">
                    <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-medium text-red-500 shadow-sm transition-all hover:bg-red-50 hover:shadow-md"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;