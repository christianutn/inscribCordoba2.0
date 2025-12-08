import { getTutores, putTutores, postTutor, deleteTutor } from "../domains/Inscribcordoba/api/controllers/tutor.controllers.js";
import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import { validateCreateTutor, validateUpdateTutor } from "../middlewares/validations/tutores.validations.js";
import manejadorValidaciones from "../utils/manejarValidacionErrores.js";

const tutorRouter = Router();

tutorRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), getTutores)

tutorRouter.put("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    validateUpdateTutor,
    manejadorValidaciones,
    putTutores)

tutorRouter.post("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    validateCreateTutor,
    manejadorValidaciones,
    postTutor)

tutorRouter.delete("/:cuil", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), deleteTutor)


export default tutorRouter