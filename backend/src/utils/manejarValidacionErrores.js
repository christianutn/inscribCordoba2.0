import { validationResult } from 'express-validator';
import AppError from './appError.js';

const manejarValidacionErrores = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const uniqueErrors = {};

        errors.array().forEach(err => {
            // Prefer 'path' (newer express-validator) but fallback to 'param'
            const field = err.path || err.param;
            if (!uniqueErrors[field]) {
                uniqueErrors[field] = new Set();
            }
            uniqueErrors[field].add(err.msg);
        });

        const errorMessages = Object.entries(uniqueErrors)
            .map(([field, msgs]) => {
                const messages = Array.from(msgs).join(', ');
                return `Campo '${field}': ${messages}`;
            })
            .join('; ');

        const mainMessage = `Errores de validación: ${errorMessages}`;

        const validationError = new AppError(mainMessage, 400);
        // Keep detailed array for frontend if needed, but unique is better for the summary
        validationError.validationDetails = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            location: err.location,
            value: err.value
        }));

        return next(validationError);
    }

    next();
};

export default manejarValidacionErrores;