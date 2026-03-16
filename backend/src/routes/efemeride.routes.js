import {
    getEfemerides,
    getEfemeridesByCurso,
    postEfemerides,
    deleteEfemeride,
    putEfemeride
} from '../domains/Inscribcordoba/api/controllers/efemeride.controllers.js';
import { Router } from 'express';
import passport from 'passport';
import autorizar from '../utils/autorizar.js';
import { body } from "express-validator";

const efemerideRouter = Router();

// GET - Obtener todas las efemérides (ADM, REF, GA)
efemerideRouter.get("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    getEfemerides
);

// GET - Obtener efemérides por curso (ADM, REF, GA)
efemerideRouter.get("/curso/:curso",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    getEfemeridesByCurso
);

// POST - Crear efemérides en lote para un curso (ADM, REF, GA)
efemerideRouter.post("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    [
        body("curso")
            .exists().withMessage("El campo curso es obligatorio")
            .isString().withMessage("El curso debe ser un string")
            .isLength({ min: 1 }).withMessage("El curso no puede estar vacío"),
        body("efemerides")
            .exists().withMessage("El campo efemerides es obligatorio")
            .isArray({ min: 1 }).withMessage("Debe incluir al menos una efeméride"),
        body("efemerides.*.fecha")
            .exists().withMessage("Cada efeméride debe tener una fecha")
            .isISO8601().withMessage("La fecha debe tener formato válido (YYYY-MM-DD)"),
        body("efemerides.*.descripcion")
            .exists().withMessage("Cada efeméride debe tener una descripción")
            .isString().withMessage("La descripción debe ser un texto")
            .isLength({ min: 1 }).withMessage("La descripción no puede estar vacía")
    ],
    postEfemerides
);

// PUT - Actualizar una efeméride (ADM, REF, GA)
efemerideRouter.put("/:id",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    putEfemeride
);

// DELETE - Eliminar una efeméride (ADM, GA)
efemerideRouter.delete("/:id",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    deleteEfemeride
);

export default efemerideRouter;
