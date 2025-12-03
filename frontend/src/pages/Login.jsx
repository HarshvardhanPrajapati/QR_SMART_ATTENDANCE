import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const res = await API.post('/auth/login', formData);
            login(res.data.token, res.data);
            
            // Redirect based on role
            if (res.data.role === 'student') navigate('/student/dashboard');
            else if (res.data.role === 'teacher') navigate('/teacher/dashboard');
            else if (res.data.role === 'admin') navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
            {/* Playful background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gradient-to-br from-sky-300/30 to-emerald-300/30 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gradient-to-br from-lime-300/30 to-teal-300/30 rounded-full blur-3xl" />
            <div className="absolute top-[45%] left-[5%] w-72 h-72 bg-gradient-to-br from-cyan-200/25 to-sky-200/25 rounded-full blur-2xl" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border border-white/40 bg-white/70 backdrop-blur-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent mb-2">Welcome back</h1>
                    <p className="text-slate-600">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-50/80 border border-red-200/80 text-red-700 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm backdrop-blur-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input 
                                type="email"
                                required
                                className="w-full bg-white/60 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 outline-none transition-all placeholder-slate-500 backdrop-blur-sm"
                                placeholder="name@university.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input 
                                type="password"
                                required
                                className="w-full bg-white/60 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 outline-none transition-all placeholder-slate-500 backdrop-blur-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Signing in...' : (
                            <>
                                <LogIn size={20} />
                                Sign in
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-sky-600 hover:text-sky-700 font-medium hover:underline">
                        Register here
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;