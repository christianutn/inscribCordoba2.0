/**
 * Wrapper de fetch centralizado para la aplicación.
 * Configurado automáticamente para enviar cookies HttpOnly en todas las peticiones
 * y limpiar headers obsoletos como Authorization.
 */
const apiClient = async (url, options = {}) => {
    
    const fetchOptions = {
        ...options,
        // MUY IMPORTANTE: Esto le dice al navegador que envíe las cookies automáticamente
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    // Si algún servicio todavía intenta enviar el token via header, lo interceptamos y borramos
    // ya que ahora la autenticación viaja por la cookie HttpOnly.
    if (fetchOptions.headers && fetchOptions.headers['Authorization']) {
        delete fetchOptions.headers['Authorization'];
    }

    try {
        const response = await fetch(url, fetchOptions);
        
        // Manejo centralizado de Errores de Autenticación (401 / 403)
        if (response.status === 401 || response.status === 403) {
            // Limpiamos datos residuales (excepto el motivo de logout para el feedback)
            localStorage.removeItem('lastActivityTimestamp');
            sessionStorage.clear();
            
            // Redirección forzada si no estamos en /login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Devolvemos el objeto response original para que el resto 
        // de la aplicación siga funcionando (response.json(), response.status, etc.) sin romperse.
        return response;

    } catch (error) {
        console.error(`[apiClient] Error en petición a ${url}:`, error);
        throw error;
    }
};

export default apiClient;
