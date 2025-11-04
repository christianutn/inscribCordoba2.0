import {getAreaTematicaByCod, getAreasTematicas} from "../domains/Inscribcordoba/api/controllers/areaTematica.controllers.js";

import {Router} from "express";

import autorizar from "../utils/autorizar.js"
import passport from "passport";

const areaTematicaRouter = Router();

areaTematicaRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getAreasTematicas)
areaTematicaRouter.get("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getAreaTematicaByCod)

export default areaTematicaRouter