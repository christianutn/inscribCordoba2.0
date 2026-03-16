import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getMyUser } from '../services/usuarios.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback((forced = false) => {
        localStorage.removeItem('jwt');
        sessionStorage.clear();
        setUser(null);
        if (forced) {
            window.location.href = '/login';
        }
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await getMyUser();
            if (res) {
                setUser(res);
            } else {
                // If getMyUser returns false, it means the token is invalid
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            // We don't logout on network errors, only on 401s if handled by service
            // For now, if getMyUser specifically returns false, we logout (above)
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        checkAuth();

        // Sync logout across tabs
        const handleStorageChange = (e) => {
            if (e.key === 'jwt' && !e.newValue) {
                logout();
            }
            if (e.key === 'jwt' && e.newValue) {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [checkAuth, logout]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
