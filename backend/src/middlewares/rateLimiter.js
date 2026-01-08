
import rateLimit from 'express-rate-limit';

// Middleware para limitar las solicitudes a endpoints públicos sensibles
export const publicApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 20, // Limita a 20 peticiones por IP cada windowMs
    standardHeaders: true, // Devuelve información de límite en los headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
    message: {
        status: 429,
        message: "Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 1 minuto."
    },
});
