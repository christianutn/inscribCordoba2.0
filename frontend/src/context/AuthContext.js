import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getMyUser, invalidarSesionPorInactividad } from '../services/usuarios.service';
import { loginConCidi } from '../services/auth.service';
import useInactivityLogout from '../hooks/useInactivityLogout';
import SessionExpiredDialog from '../components/SessionExpiredDialog';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSessionExpired, setShowSessionExpired] = useState(false);
    const [cidiError, setCidiError] = useState(null);

    const logout = useCallback((forced = false) => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('lastActivityTimestamp');
        sessionStorage.clear();
        
        // Intentar borrar la cookie de CiDi para evitar re-login automático
        document.cookie = "CiDi=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "CiDi=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.cba.gov.ar";
        document.cookie = "CiDi=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.test.cba.gov.ar";

        setUser(null);
        if (forced) {
            window.location.href = '/login';
        }
    }, []);

    /**
     * Intenta autenticar al usuario vía CiDi usando un hashCookie.
     * Retorna true si el login fue exitoso, false si no.
     */
    const loginCidi = useCallback(async (hashCookie) => {
        try {
            setCidiError(null);
            const token = await loginConCidi(hashCookie);
            localStorage.setItem('jwt', token);

            // IMPORTANTE: Borramos la cookie de CiDi después de obtener nuestro JWT
            // para que el logout funcione y no nos re-loguee automáticamente.
            document.cookie = "CiDi=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "CiDi=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.cba.gov.ar";
            document.cookie = "CiDi=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.test.cba.gov.ar";

            return true;
        } catch (error) {
            console.error("Error en login CiDi:", error.message);
            setCidiError(error.message);
            return false;
        }
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('jwt');

        // Si no hay JWT, verificar si hay cookie "CiDi" seteada por el portal de CiDi
        if (!token) {
            const cidiCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('CiDi='));

            if (cidiCookie) {
                const hashCookie = cidiCookie.split('=')[1];

                // Intentar login con CiDi
                const success = await loginCidi(hashCookie);
                if (success) {
                    // Obtener datos del usuario con el JWT recién generado
                    const res = await getMyUser();
                    if (res) {
                        setUser(res);
                    }
                }
                setLoading(false);
                return;
            }

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
    }, [logout, loginCidi]);

    // Callback de inactividad: invalidar sesión en el backend y mostrar el diálogo
    const handleInactivity = useCallback(async () => {
        if (!user) return;

        // Marcar el motivo para que el Login sepa qué mostrar si se sincronizan las pestañas
        localStorage.setItem('logout_reason', 'inactivity');

        // Intentar invalidar la sesión en el backend (incrementar token_version)
        await invalidarSesionPorInactividad();

        // Mostrar el diálogo de sesión expirada
        setShowSessionExpired(true);
    }, [user]);

    // Handler cuando el usuario cierra el diálogo
    const handleSessionExpiredClose = useCallback(() => {
        setShowSessionExpired(false);
        localStorage.removeItem('logout_reason'); // Limpiar porque el usuario ya fue notificado por el diálogo
        logout(true); // Forzar redirección a login
    }, [logout]);

    // Activar el hook de inactividad solo cuando el usuario está autenticado
    useInactivityLogout(handleInactivity, !!user);

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
        <AuthContext.Provider value={{ user, setUser, loading, logout, checkAuth, showSessionExpired, cidiError, setCidiError }}>
            {children}
            <SessionExpiredDialog
                open={showSessionExpired}
                onClose={handleSessionExpiredClose}
            />
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
