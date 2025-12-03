import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Lock, BookOpen, Hash, Building2, Phone, Briefcase, GraduationCap } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    
    // Default Role is Student
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        // Student specific
        rollNumber: '',
        department: '',
        semester: '',
        // Teacher specific
        designation: '',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Filter data based on role to avoid sending empty irrelevant fields
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role,
                department: formData.department,
                ...(role === 'student' && {
                    rollNumber: formData.rollNumber,
                    semester: formData.semester
                }),
                ...(role === 'teacher' && {
                    designation: formData.designation,
                    phone: formData.phone
                })
            };

            const res = await API.post('/auth/register', payload);
            login(res.data.token, res.data);
            
            // Redirect
            if (role === 'student') navigate('/student/dashboard');
            else navigate('/teacher/dashboard');
            
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 via-emerald-50 to-lime-50 py-10 px-4 flex items-center justify-center">
            {/* Playful background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-80 h-80 bg-gradient-to-br from-sky-300/30 to-emerald-300/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-gradient-to-br from-lime-300/30 to-teal-300/30 rounded-full blur-3xl" />
                <div className="absolute top-[45%] left-[5%] w-72 h-72 bg-gradient-to-br from-cyan-200/25 to-sky-200/25 rounded-full blur-2xl" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-2xl p-8 rounded-2xl relative z-10 border border-white/40 bg-white/70 backdrop-blur-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent mb-2">Create Account</h1>
                    <p className="text-slate-600">Join the Smart Attendance System</p>
                </div>

                {/* Role Toggle */}
                <div className="flex bg-white/60 p-1 rounded-xl mb-8 max-w-xs mx-auto border border-slate-200 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium ${
                            role === 'student' ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <GraduationCap size={18} /> Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('teacher')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium ${
                            role === 'teacher' ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Briefcase size={18} /> Teacher
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50/80 border border-red-200/80 text-red-700 p-3 rounded-xl mb-6 text-sm text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Common Fields */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <InputGroup icon={User} type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                        <InputGroup icon={Mail} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                        <InputGroup icon={Lock} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                    </div>

                    <div className="col-span-1 md:col-span-2 border-t border-slate-200 my-2"></div>

                    {/* Dynamic Fields */}
                    {role === 'student' ? (
                        <>
                            <InputGroup icon={Hash} type="text" name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleChange} />
                            <InputGroup icon={Building2} type="text" name="department" placeholder="Department (e.g., CSE)" value={formData.department} onChange={handleChange} />
                            <InputGroup icon={BookOpen} type="number" name="semester" placeholder="Semester (1-8)" value={formData.semester} onChange={handleChange} />
                        </>
                    ) : (
                        <>
                            <InputGroup icon={Building2} type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
                            <InputGroup icon={Briefcase} type="text" name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} />
                            <InputGroup icon={Phone} type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                        </>
                    )}

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-sky-500/25"
                        >
                            {loading ? 'Creating Account...' : 'Register Now'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium hover:underline">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

// Helper Component for Inputs to keep code clean
const InputGroup = ({ icon: Icon, type, name, placeholder, value, onChange }) => (
    <div className="relative">
        <Icon className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
            type={type}
            name={name}
            placeholder={placeholder}
            required
            value={value}
            onChange={onChange}
            className="w-full bg-white/60 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 outline-none transition-all placeholder-slate-500 backdrop-blur-sm text-sm"
        />
    </div>
);

export default Register;