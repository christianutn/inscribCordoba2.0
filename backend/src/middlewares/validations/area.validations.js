import AreaModel from '../../domains/Inscribcordoba/api/models/area.models.js'
import MinisterioModel from "../../domains/Inscribcordoba/api/models/ministerio.models.js";
import AppError from "../../utils/appError.js";
import { body } from "express-validator";

export const areaUpdateValidation = [
    body("cod").exists().isString().isLength({ min: 1, max: 15 }).withMessage("El código debe contener entre 1 a 15 caracteres")
        .custom(async (value) => {
            const area = await AreaModel.findByPk(value)
            if (!area) {
                throw new AppError(`El area no existe`, 400);
            }
        }),
    body("nombre").optional().isString().isLength({ min: 1, max: 250 }).withMessage("El nombre es requerido"),
    body("ministerio").optional().isString().isLength({ max: 15, min: 1 }).withMessage("El ministerio es requerido")
        .custom(async (value) => {
            const minist = await MinisterioModel.findByPk(value)
            if (!minist) throw new AppError("El ministerio no existe")
        }),
    body("esVigente").optional().isBoolean().withMessage("El estado es requerido")

]