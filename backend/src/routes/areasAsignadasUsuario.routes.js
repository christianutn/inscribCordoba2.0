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
router.get("/", auth, autorizar(['ADM']), getAreasAsignadas);

// Crear una nueva asignación de área
router.post(
    "/",
    [
        check("cod_area")
            .exists().isString({ max: 15 }).withMessage("El area es requerido")
            .custom(async (value) => {
                const area = await Area.findOne({ where: { cod: value } });
                if (!area) {
                    throw new AppError(`No se encontró un área con el código ${value}`, 404);
                }
            }),
        check("cuil_usuario")
            .exists().isString({ max: 11 }).withMessage("El usuario es requerido")
            .custom(async (value) => {
                const usuario = await Usuario.findOne({ where: { cuil: value } });
                if (!usuario) {
                    throw new AppError(`No se encontró un usuario con el cuil ${value}`, 404);
                }
            }),
        // Validación de duplicidad de asignación
        check("cuil_usuario").custom(async (value, { req }) => {
            const areaAsignada = await AreasAsignadasUsuario.findOne({
                where: { usuario: value, area: req.body.cod_area }
            });
            if (areaAsignada) {
                throw new AppError(
                    `Ya existe una asignación de area para el usuario ${value} y el area ${req.body.cod_area}`,
                    400
                );
            }
        })
    ],
    manejarValidacionErrores,
    auth,
    autorizar(['ADM']),
    postAreaAsignada
);

// Actualizar una asignación existente
router.put("/", auth, autorizar(['ADM']), putAreaAsignada);

// Eliminar una asignación
router.delete("/:usuario/:area", auth, autorizar(['ADM']), deleteAreaAsignada);

// Obtener áreas asignadas de un usuario específico
router.get("/usuario/:usuario", auth, autorizar(['ADM', 'REF', , 'GA']), getAreasAsignadasPorUsuario);

export default router;
