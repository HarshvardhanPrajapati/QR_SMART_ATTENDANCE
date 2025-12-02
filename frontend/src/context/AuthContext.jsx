import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on load
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt_decode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    // You might want to fetch full user details here if needed
                    setUser(decoded); 
                }
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        const decoded = jwt_decode(token);
        setUser({ ...decoded, ...userData });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;