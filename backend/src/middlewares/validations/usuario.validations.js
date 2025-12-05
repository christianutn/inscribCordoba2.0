import { validateCreatePersona } from "./persona.validations.js"
import { body, param } from "express-validator"


export const validateCreateUsuario = [
    ...validateCreatePersona,
    // Validaciones y Sanitización para la tabla 'usuarios'
    body('rol')
        .isLength({ min: 1, max: 15 }).withMessage('El rol es obligatorio y debe tener entre 1 y 15 caracteres (código).')
        .trim(), // Útil para códigos

    // Campo no obligatorio en 'usuarios'
    body('area')
        .optional({ checkFalsy: true })
        .isString().withMessage('El código de área debe ser una cadena de texto.')
        .isLength({ max: 15 }).withMessage('El código de área no debe exceder los 15 caracteres.')
        .trim(), // Útil para códigos
]


export const validateUpdateUsuario = [
    ...validateCreateUsuario,
    body('activo')
        .isBoolean().withMessage('El campo "activo" debe ser un booleano.')
]


export const validateDeleteUsuario = [
    param('cuil')
        .isLength({ min: 11, max: 11 }).withMessage('El CUIL es obligatorio y debe tener exactamente 11 caracteres.')
        .trim()
        .customSanitizer(value => {
            // Elimina todo lo que no sea número
            return value ? String(value).replace(/[^0-9]/g, '') : value;
        })
]