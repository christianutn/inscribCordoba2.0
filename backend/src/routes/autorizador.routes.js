import { getAutorizadores, postAutorizador } from "../domains/Inscribcordoba/api/controllers/autorizador.controllers.js";
import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const autorizadorRouter = Router();


autorizadorRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', , 'GA']), getAutorizadores)
autorizadorRouter.post("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'GA']), postAutorizador)

export default autorizadorRouter