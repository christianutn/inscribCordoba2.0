import {getAutorizadores} from "../controllers/autorizador.controllers.js";
import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const autorizadorRouter = Router();


autorizadorRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', , 'GA']), getAutorizadores)

export default autorizadorRouter