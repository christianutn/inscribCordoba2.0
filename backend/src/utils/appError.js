/**
 * Clase personalizada para manejar errores operacionales de la aplicación.
 * Permite definir un mensaje, un código de estado HTTP y marcar si es un error operacional.
 */
class AppError extends Error {
    /**
     * Crea una instancia de AppError.
     * @param {string} message - El mensaje de error que se mostrará.
     * @param {number} statusCode - El código de estado HTTP para la respuesta.
     */
    constructor(message, statusCode) {
        // Llama al constructor de la clase padre (Error) y le pasa el mensaje.
        // Esto asegura que la propiedad 'message' se establezca correctamente.
        super(message);

        // Propiedades personalizadas
        this.statusCode = statusCode;

        // Determina el 'status' basado en el statusCode:
        // 'fail' para errores del cliente (4xx), 'error' para errores del servidor (5xx).
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Marca este error como un error operacional.
        // Los errores operacionales son errores esperados y manejables (ej. entrada inválida),
        // a diferencia de los errores de programación (bugs).
        this.isOperational = true;

        // Captura el stack trace de dónde se originó el error,
        // excluyendo la llamada al constructor de AppError de la traza.
        // Esto hace que el stack trace sea más limpio y apunte al lugar real del problema.
        Error.captureStackTrace(this, this.constructor);
    }
}

// Exportar la clase usando la sintaxis ESM
export default AppError;