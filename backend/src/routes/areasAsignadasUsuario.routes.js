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

const router = Router();
const auth = passport.authenticate('jwt', { session: false });

// Obtener todas las áreas asignadas
router.get("/", auth, autorizar(['ADM']), getAreasAsignadas);

// Crear una nueva asignación de área
router.post("/", auth, autorizar(['ADM']), postAreaAsignada);

// Actualizar una asignación existente
router.put("/", auth, autorizar(['ADM']), putAreaAsignada);

// Eliminar una asignación
router.delete("/:usuario/:area", auth, autorizar(['ADM']), deleteAreaAsignada);

// Obtener áreas asignadas de un usuario específico
router.get("/usuario/:usuario", auth, autorizar(['ADM', 'REF']), getAreasAsignadasPorUsuario);

export default router;
