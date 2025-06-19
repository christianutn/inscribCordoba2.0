import { validationResult } from 'express-validator';
import AppError from './appError.js';

const manejerValidacionErrores = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err =>
            `Campo '${err.path}': ${err.msg} (valor recibido: '${err.value}')`
        ).join('; ');

        const mainMessage = `Errores de validación en los datos de entrada. Por favor, corrija los siguientes problemas: ${errorMessages}`;

        const validationError = new AppError(mainMessage, 400);
        validationError.validationDetails = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            location: err.location,
            value: err.value
        }));

        return next(validationError);
    }

   

    next();
};

export default manejerValidacionErrores;