

import { commonCuil, commonNombreApellido, commonEmail, commonCelular } from "./common.validations.js";
// -----------------------------------------------------
// 1. Validaciones para CREAR (POST)
// -----------------------------------------------------
export const validateCreatePersona = [
    // Campos OBLIGATORIOS (NOT NULL en DB)
    commonCuil.exists(),
    commonNombreApellido('nombre'), // Usamos la función genérica pasando el nombre del campo
    commonNombreApellido('apellido'),

    // Campos OPCIONALES (DEFAULT NULL en DB)
    // Usamos .optional({ checkFalsy: true }) para que ignore si viene null o string vacío
    commonEmail.optional({ checkFalsy: true }),
    commonCelular.optional({ checkFalsy: true }),

];

// ---------------------------------------------------

