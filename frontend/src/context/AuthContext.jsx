import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for user data
        const storedUser = localStorage.getItem('tms_user');
        const storedToken = localStorage.getItem('tms_token');

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data", e);
                localStorage.removeItem('tms_user');
                localStorage.removeItem('tms_token');
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        // data should contain user info and tokens
        // Adjust based on actual backend response structure
        // Expected: { access, refresh, user: { ... } } or similar

        if (data.user) {
            setUser(data.user);
            localStorage.setItem('tms_user', JSON.stringify(data.user));
        }

        if (data.access) {
            localStorage.setItem('tms_token', data.access);
        }

        if (data.refresh) {
            localStorage.setItem('tms_refresh_token', data.refresh);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tms_user');
        localStorage.removeItem('tms_token');
        localStorage.removeItem('tms_refresh_token');
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
