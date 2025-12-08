import { getCursos, postCurso, updateCurso, deleteCurso } from "../domains/Inscribcordoba/api/controllers/curso.controllers.js";
import { validateUpdateCurso } from "../middlewares/validations/curso.validations.js";
import manejarValidacionErrores from "../utils/manejarValidacionErrores.js";
import { Router } from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const cursoRouter = Router();


cursoRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), getCursos)

cursoRouter.post("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    validateUpdateCurso, // es la misma que para actualizar
    manejarValidacionErrores,
    postCurso)

cursoRouter.put("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    validateUpdateCurso,
    manejarValidacionErrores,
    updateCurso)


cursoRouter.delete("/:cod", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), deleteCurso)


export default cursoRouter
