import { getRolesTutor } from "../domains/Inscribcordoba/api/controllers/rol_tutor.controllers.js";
import { Router } from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";
const tipoRolTutorRouter = Router();


tipoRolTutorRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), getRolesTutor)

export default tipoRolTutorRouter