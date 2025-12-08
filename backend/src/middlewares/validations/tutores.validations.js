import { validateCreatePersona } from "./persona.validations.js"
import { body } from "express-validator"
import Tutor from "../../domains/Inscribcordoba/api/models/tutor.models.js"
import AppError from "../../utils/appError.js"

export const validateCreateTutor = [
    validateCreatePersona,
    body('cuil').custom(async (value) => {
        const tutor = await Tutor.findByPk(value);
        if (tutor) {
            throw new AppError('El tutor ya existe', 400);
        }
        return true;
    }),

    body('area').notEmpty().withMessage('El campo "area" es requerido'),

    body('esReferente').notEmpty().withMessage('El campo "esReferente" es requerido')
        .isIn([1, 0]).withMessage('El campo "esReferente" debe ser 1 o 0'),
]

export const validateUpdateTutor = [
    validateCreatePersona,
    body('area').notEmpty().withMessage('El campo "area" es requerido'),

    body('esReferente').notEmpty().withMessage('El campo "esReferente" es requerido')
        .isIn([1, 0]).withMessage('El campo "esReferente" debe ser 1 o 0'),
]
