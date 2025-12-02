import axios from 'axios';

const API = axios.create({
    baseURL: 'https://qr-smart-attendance.vercel.app/api', // Adjust if your backend port is different
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;