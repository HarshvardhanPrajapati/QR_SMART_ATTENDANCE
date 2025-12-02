import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

// Helper to read a cookie by name
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Helper to set a cookie (30 days by default)
const setCookie = (name, value, days = 30) => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
};

// Helper to delete a cookie
const deleteCookie = (name) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0`;
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Try to get token from localStorage (used for Authorization header)
        const token = localStorage.getItem('token');

        // 2. Try to get user profile from cookie (name, role, email, etc.)
        const userCookie = getCookie('user');
        let cookieUser = null;
        if (userCookie) {
            try {
                cookieUser = JSON.parse(decodeURIComponent(userCookie));
            } catch (e) {
                cookieUser = null;
            }
        }

        if (token) {
            try {
                const decoded = jwt_decode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    deleteCookie('user');
                    setUser(null);
                } else {
                    // Merge decoded token (id, role, etc.) with cookieUser (name, email, etc.)
                    setUser({ ...decoded, ...cookieUser });
                }
            } catch (error) {
                localStorage.removeItem('token');
                deleteCookie('user');
                setUser(null);
            }
        } else if (cookieUser) {
            // Fallback: if somehow we have a cookie but no token, still restore basic user info
            setUser(cookieUser);
        }

        setLoading(false);
    }, []);

    const login = (token, userData) => {
        // Persist token for API auth
        localStorage.setItem('token', token);

        // Store user details in a cookie so they survive refresh
        const { name, email, role, _id } = userData || {};
        const cookiePayload = { name, email, role, _id };
        setCookie('user', JSON.stringify(cookiePayload));

        const decoded = jwt_decode(token);
        setUser({ ...decoded, ...cookiePayload });
    };

    const logout = () => {
        localStorage.removeItem('token');
        deleteCookie('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;