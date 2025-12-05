import { check } from "express-validator";
import tratarNombres from "../../utils/tratarNombres.js";
// --- 1. Validaciones Específicas (Campos con nombre fijo) ---

// Validador para CUIL (Usado en Personas, Usuarios, Tutores, etc.)
export const commonCuil = check('cuil')
    .trim()
    .notEmpty().withMessage('El CUIL es obligatorio.')
    .isNumeric().withMessage('El CUIL debe contener solo números.')
    .isLength({ min: 11, max: 11 }).withMessage('El CUIL debe tener exactamente 11 caracteres.');

// Validador para Email (Sanitizado y validado)
// Nota: No le ponemos .notEmpty() aquí para poder usarlo como opcional luego.
export const commonEmail = check('mail')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('El formato del correo electrónico es inválido.')
    .isLength({ max: 100 }).withMessage('El correo no debe exceder los 100 caracteres.');

// Validador para Celular (Sanitiza dejando solo números)
export const commonCelular = check('celular')
    .trim()
    .customSanitizer(value => {
        // Elimina todo lo que no sea número
        return value ? String(value).replace(/[^0-9]/g, '') : value;
    })
    .isLength({ max: 10 }).withMessage('El celular no debe exceder los 10 caracteres.');


// --- 2. Validaciones Genéricas (Funciones para campos variables) ---

// Para Nombres, Apellidos, Títulos (VARCHAR 100)

export const commonNombreApellido = (campo) => check(campo)
    .customSanitizer((value) => {
        // Aquí 'value' es el valor de req.body[campo].
        // Lo pasas de forma EXPLICITA a tu función.
        return tratarNombres(value);
    })
    // El resto de la cadena de validación sigue igual
    .notEmpty().withMessage(`El campo ${campo} es obligatorio.`)
    .isString().withMessage(`El campo ${campo} debe ser texto.`)
    .isLength({ min: 1, max: 100 }).withMessage(`El campo ${campo} no debe exceder los 100 caracteres.`);