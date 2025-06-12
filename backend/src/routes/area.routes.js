import {getAreas, putArea, postArea, deleteArea} from "../controllers/area.controllers.js"
import {Router} from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import AppError from "../utils/appError.js";
import manejarValidacionErrores from "../utils/manejarValidacionErrores.js";
import {check} from "express-validator";
import AreaModel from "../models/area.models.js";
import MinisterioModel from "../models/ministerio.models.js";

const areaRouter = Router();

areaRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getAreas)

areaRouter.put("/", [
    check("cod").exists().isString({max: 15}).withMessage("El código es requerido"),
    check("nombre").optional().isString({max: 250}).withMessage("El nombre es requerido"),
    check("ministerio").optional().isString({max: 15}).withMessage("El ministerio es requerido"),
    check("esVigente").optional().isBoolean().withMessage("El estado es requerido"),
    check("newCod").optional().isString({max: 15}).withMessage("El nuevo codigo es requerido"),
    check("cod").custom(async (value) => {
        const area = await AreaModel.findOne({ where: { cod: value } });
        if (!area) {
            throw new AppError(`No se encontró un área con el código ${value}`, 404);
        }
    })
], 
    manejarValidacionErrores,
     passport.authenticate('jwt', {session: false}), 
     autorizar(['ADM']),
     putArea)



areaRouter.post("/",
    [
        check("cod").exists().isString({max: 15}).withMessage("El código es requerido").custom(async (value) => {
            const area = await AreaModel.findOne({ where: { cod: value } });
            if (area) {
                throw new AppError(`Ya existe un área con el código ${value}`, 400);
            }
        }),
        check("nombre").exists().isString({max: 250}).withMessage("El nombre es requerido"),
        check("ministerio").exists().isString({max: 15}).withMessage("El ministerio es requerido").custom(async (value) => {
            const ministerio = await MinisterioModel.findOne({ where: { cod: value } });
            if (!ministerio) {
                throw new AppError(`No se encontró un ministerio con el código ${value}`, 400);
            }
        }),
        
    ],
    manejarValidacionErrores,
    passport.authenticate('jwt', {session: false}), 
    autorizar(['ADM']), 
    postArea)


areaRouter.delete("/:cod",  
    [
        check("cod").exists().isString({max: 15}).withMessage("El codigo es requerido")
    ],
    manejarValidacionErrores,
    passport.authenticate('jwt', {session: false}), 
    autorizar(['ADM']),
    deleteArea)



export default areaRouter