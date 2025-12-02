import axios from 'axios';

// For local development, point to your local backend
// You can later make this dynamic via Vite env vars if needed.
const API = axios.create({
    baseURL: 'https://qr-smart-attendance.vercel.app/api',
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