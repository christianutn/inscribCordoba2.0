import { Router } from "express";
import {
    getAreasAsignadas,
    postAreaAsignada,
    putAreaAsignada,
    deleteAreaAsignada,
    getAreasAsignadasPorUsuario
} from "../controllers/areasAsignadasUsuario.controllers.js";
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import AppError from "../utils/appError.js";
import manejarValidacionErrores from "../utils/manejarValidacionErrores.js";
import { check } from "express-validator";
import Usuario from "../models/usuario.models.js";
import Area from "../models/area.models.js";
import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";


const router = Router();
const auth = passport.authenticate('jwt', { session: false });

// Obtener todas las áreas asignadas
router.get("/",
    auth,
    autorizar(['ADM']),
    getAreasAsignadas);

// Crear una nueva asignación de área
router.post(
    "/",
    auth,
    autorizar(['ADM']),
    [
        check("cod_area")
            .exists().isString({ max: 15, min: 1 }).withMessage("El código de area es requerido y debe tener entre 1 a 15 caracteres")
            .custom(async (value) => {
                const area = await Area.findOne({ where: { cod: value } });
                if (!area) {
                    throw new AppError(`No se encontró un área con el código ${value}`, 404);
                }
            }),
        check("cuil_usuario")
            .exists().withMessage("El campo cuil_usuario es requerido")
            .isString().withMessage("El cuil debe ser una cadena de texto")
            .isLength({ min: 1, max: 11 }).withMessage("El cuil debe tener entre 1 y 11 caracteres")
            .custom(async (value, { req }) => {
                const usuario = await Usuario.findOne({ where: { cuil: value } });
                if (!usuario) {
                    throw new AppError(`No se encontró un usuario con el cuil ${value}`, 404);
                }

                const areaAsignada = await AreasAsignadasUsuario.findOne({
                    where: {
                        usuario: value,
                        area: req.body.cod_area
                    }
                });

                if (areaAsignada) {
                    throw new AppError(
                        `Ya existe una asignación de área para el usuario ${value} y el área ${req.body.cod_area}`,
                        400
                    );
                }
            })
    ],
    manejarValidacionErrores,
    postAreaAsignada
);

// Actualizar una asignación existente
router.put("/", auth, autorizar(['ADM']), putAreaAsignada);

// Eliminar una asignación
router.delete("/:usuario/:area", auth, autorizar(['ADM']), deleteAreaAsignada);

// Obtener áreas asignadas de un usuario específico
router.get("/usuario/:usuario", auth, autorizar(['ADM', 'REF', , 'GA']), getAreasAsignadasPorUsuario);

export default router;
