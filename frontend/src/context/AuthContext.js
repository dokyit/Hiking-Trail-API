import React, { createContext, useContext, useState, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = useMemo(() => ({ token, login, logout }), [token]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
