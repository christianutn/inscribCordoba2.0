import { getAreas, putArea, postArea, deleteArea } from "../domains/Inscribcordoba/api/controllers/area.controllers.js"
import { Router } from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import AppError from "../utils/appError.js";
import manejarValidacionErrores from "../utils/manejarValidacionErrores.js";
import { check, param, body } from "express-validator";
import AreaModel from "../domains/Inscribcordoba/api/models/area.models.js";
import MinisterioModel from "../domains/Inscribcordoba/api/models/ministerio.models.js";
import { areaUpdateValidation } from "../middlewares/validations/area.validations.js";

const areaRouter = Router();

areaRouter.get("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    getAreas)

areaRouter.put("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    areaUpdateValidation,
    manejarValidacionErrores,
    putArea)



areaRouter.post("/",
    [
        passport.authenticate('jwt', { session: false }),
        autorizar(['ADM']),
        check("cod").exists().isString().isLength({ min: 1, max: 15 }).withMessage("El código debe contener entre 1 a 15 caracteres").custom(async (value) => {
            const area = await AreaModel.findOne({ where: { cod: value } });
            if (area) {
                throw new AppError(`Ya existe un área con el código ${value}`, 400);
            }
        }),
        check("nombre").exists().isString().isLength({ min: 1, max: 250 }).withMessage("El nombre de área debe contenener un máximo de 250 caracteres"),
        check("ministerio").exists().isString().isLength({ max: 15, min: 1 }).withMessage("El ministerio es requerido").custom(async (value) => {
            const ministerio = await MinisterioModel.findOne({ where: { cod: value } });
            if (!ministerio) {
                throw new AppError(`No se encontró un ministerio con el código ${value}`, 400);
            }
        }),
    ],
    manejarValidacionErrores,

    postArea)


areaRouter.delete("/:cod",
    [
        check("cod").exists().isString({ max: 15 }).withMessage("El codigo es requerido")
    ],
    manejarValidacionErrores,
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    deleteArea)



export default areaRouter