import {getEstados} from "../controllers/estado.controllers.js";
import {Router} from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const estadoRouter = Router();

estadoRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getEstados)


export default estadoRouter