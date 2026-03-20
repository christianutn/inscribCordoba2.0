import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora en milisegundos
const ACTIVITY_THROTTLE_MS = 30 * 1000; // Throttle de 30 segundos para no recalcular en cada evento

/**
 * Hook que detecta inactividad del usuario (sin mouse, teclado, scroll, click, touch).
 * Si pasa 1 hora sin interacción, llama al callback `onInactive`.
 * 
 * Se usa `localStorage` para persistir la última actividad entre pestañas y recargas.
 */
const useInactivityLogout = (onInactive, isEnabled = true) => {
    const timerRef = useRef(null);
    const lastActivityRef = useRef(Date.now());
    const throttleRef = useRef(null);

    const STORAGE_KEY = 'lastActivityTimestamp';

    // Guardar la última actividad en localStorage para sincronizar entre pestañas
    const updateLastActivity = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;
        try {
            localStorage.setItem(STORAGE_KEY, now.toString());
        } catch (e) {
            // silently fail if localStorage is not available
        }
    }, []);

    // Resetear el timer de inactividad
    const resetTimer = useCallback(() => {
        if (!isEnabled) return;

        updateLastActivity();

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            if (onInactive) {
                onInactive();
            }
        }, INACTIVITY_TIMEOUT_MS);
    }, [isEnabled, onInactive, updateLastActivity]);

    // Handler con throttle para eventos de actividad
    const handleActivity = useCallback(() => {
        if (!isEnabled) return;

        // Throttle: no resetear el timer si la última actividad fue hace menos de ACTIVITY_THROTTLE_MS
        const now = Date.now();
        if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) {
            return;
        }

        resetTimer();
    }, [isEnabled, resetTimer]);

    useEffect(() => {
        if (!isEnabled) return;

        // Verificar si ya estaba inactivo al cargar (por ejemplo, si cerró la pestaña y volvió)
        const storedTimestamp = localStorage.getItem(STORAGE_KEY);
        if (storedTimestamp) {
            const elapsed = Date.now() - parseInt(storedTimestamp, 10);
            if (elapsed >= INACTIVITY_TIMEOUT_MS) {
                // Ya pasó la hora de inactividad
                if (onInactive) {
                    onInactive();
                }
                return;
            }
        }

        // Iniciar el timer
        resetTimer();

        // Eventos de actividad del usuario
        const events = [
            'mousemove',
            'mousedown',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'wheel'
        ];

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // También escuchar cuando la pestaña vuelve a tener foco
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Verificar si ya expiró mientras estaba en background
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const elapsed = Date.now() - parseInt(stored, 10);
                    if (elapsed >= INACTIVITY_TIMEOUT_MS) {
                        if (onInactive) {
                            onInactive();
                        }
                        return;
                    }
                }
                resetTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Sincronizar entre pestañas
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                // Otra pestaña registró actividad, actualizar timer local
                lastActivityRef.current = parseInt(e.newValue, 10);
                resetTimer();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isEnabled, handleActivity, resetTimer, onInactive]);

    return { resetTimer };
};

export default useInactivityLogout;
