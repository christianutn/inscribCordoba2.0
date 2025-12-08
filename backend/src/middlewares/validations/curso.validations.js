import { body } from "express-validator";

export const validateUpdateCurso = [

    // cod
    body("cod")
        .notEmpty().withMessage("El código es obligatorio")
        .isLength({ max: 15 }).withMessage("El código no puede superar 15 caracteres"),

    // nombre
    body("nombre")
        .notEmpty().withMessage("El nombre es obligatorio")
        .isLength({ max: 250 }).withMessage("El nombre no puede superar 250 caracteres"),

    // cupo
    body("cupo")
        .notEmpty().withMessage("El cupo es obligatorio")
        .isInt({ min: 1 }).withMessage("El cupo debe ser un número entero mayor o igual a 1"),

    // cantidad_horas
    body("cantidad_horas")
        .notEmpty().withMessage("La cantidad de horas es obligatoria")
        .isInt({ min: 1 }).withMessage("La cantidad de horas debe ser un número entero mayor o igual a 1"),

    // medio_inscripcion
    body("medio_inscripcion")
        .notEmpty().withMessage("El medio de inscripción es obligatorio")
        .isLength({ max: 15 }).withMessage("medio_inscripcion no puede exceder 15 caracteres"),

    // plataforma_dictado
    body("plataforma_dictado")
        .notEmpty().withMessage("La plataforma de dictado es obligatoria")
        .isLength({ max: 15 }).withMessage("plataforma_dictado no puede exceder 15 caracteres"),

    // tipo_capacitacion
    body("tipo_capacitacion")
        .notEmpty().withMessage("El tipo de capacitación es obligatorio")
        .isLength({ max: 15 }).withMessage("tipo_capacitacion no puede exceder 15 caracteres"),

    // area
    body("area")
        .notEmpty().withMessage("El área es obligatoria")
        .isLength({ max: 15 }).withMessage("area no puede exceder 15 caracteres"),

    // BOOLEANOS (TINYINT)
    body("esVigente")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("esVigente debe ser 0 o 1"),

    body("tiene_evento_creado")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("tiene_evento_creado debe ser 0 o 1"),

    body("es_autogestionado")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("es_autogestionado debe ser 0 o 1"),

    body("tiene_restriccion_edad")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("tiene_restriccion_edad debe ser 0 o 1"),

    body("tiene_restriccion_departamento")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("tiene_restriccion_departamento debe ser 0 o 1"),

    body("publica_pcc")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("publica_pcc debe ser 0 o 1"),

    body("tiene_correlatividad")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("tiene_correlatividad debe ser 0 o 1"),

    body("esta_maquetado")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("esta_maquetado debe ser 0 o 1"),

    body("esta_configurado")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("esta_configurado debe ser 0 o 1"),

    body("aplica_sincronizacion_certificados")
        .optional({ checkFalsy: true })
        .isIn([0, 1]).withMessage("aplica_sincronizacion_certificados debe ser 0 o 1"),

    // numero_evento
    body("numero_evento")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 }).withMessage("numero_evento debe ser un entero positivo"),

    // url_curso
    body("url_curso")
        .optional({ checkFalsy: true })
        .isLength({ max: 500 }).withMessage("La URL no puede superar los 500 caracteres")
        .isURL().withMessage("La URL del curso no es válida"),
];
