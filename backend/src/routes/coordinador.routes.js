import { getCoordinadores } from "../domains/Inscribcordoba/api/controllers/coordinadores.controllers.js";
import { Router } from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const coordinadorRouter = Router();

coordinadorRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), getCoordinadores)

export default coordinadorRouter


