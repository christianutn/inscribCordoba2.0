// Importa tu clase AppError para poder usar 'instanceof'
import AppError from "../utils/appError.js"; // Ajusta la ruta si es necesario

// Función para manejar errores en modo desarrollo (más detalles para el desarrollador)
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        // Incluye los errores de validación si existen
        errors: err.isValidationError ? err.validationErrors : undefined,
        stack: err.stack,
        error: err, // Para tener el objeto de error completo en desarrollo
    });
};

// Función para manejar errores en modo producción (mensajes más amigables para el usuario)
const sendErrorProd = (err, res) => {
    // Errores operacionales (AppError): se envía el mensaje esperado
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            // Incluye los errores de validación si existen
            errors: err.isValidationError ? err.validationErrors : undefined,
        });
        
    } else {
        // Errores de programación o desconocidos: no se filtraron por AppError, son bugs
        // 1) Log el error
        console.error('ERROR 💥', err); // Siempre loguear errores no operacionales

        // 2) Enviar mensaje genérico al cliente
        res.status(500).json({
            status: 'error',
            message: '¡Algo salió muy mal!', // Mensaje genérico y seguro
        });
    }
};

// Middleware para manejar errores generales
// app.use((err, req, res, next) => { ... })
// Asegúrate de que este middleware sea el ÚLTIMO que uses con `app.use`
const globalErrorHandler = (err, req, res, next) => {
    // Si el error no tiene un statusCode, por defecto es 500 (Internal Server Error)
    err.statusCode = err.statusCode || 500;
    // Si el error no tiene un status, por defecto es 'error'
    err.status = err.status || 'error';

    // Determina si estamos en desarrollo o producción
    if (process.env.NODE_ENV === 'desarrollo' || process.env.NODE_ENV === "test") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'produccion') {
        // Aquí puedes copiar propiedades del error original si quieres,
        // pero generalmente err.isOperational ya maneja esto.
        // Si tienes errores específicos de MongoDB o Mongoose que quieres convertir a AppError,
        // harías la lógica aquí (ej. handleCastErrorDB, handleDuplicateFieldsDB, etc.)
        // Por ejemplo:
        // if (err.name === 'CastError') err = handleCastErrorDB(err);
        // if (err.code === 11000) err = handleDuplicateFieldsDB(err);
        // if (err.name === 'ValidationError') err = handleValidationErrorDB(err); // Mongoose validation

        sendErrorProd(err, res);
    }
};

export default globalErrorHandler