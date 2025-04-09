import {getAreaTematicaByCod, getAreasTematicas} from "../controllers/areaTematica.controllers.js";

import {Router} from "express";

import autorizar from "../utils/autorizar.js"
import passport from "passport";

const areaTematicaRouter = Router();

areaTematicaRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getAreasTematicas)
areaTematicaRouter.get("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getAreaTematicaByCod)

export default areaTematicaRouter