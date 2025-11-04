import {getTiposCapacitacion, postTiposCapacitacion, deleteTiposCapacitacion, putTiposCapacitacion} from "../domains/Inscribcordoba/api/controllers/tipoCapacitacion.controllers.js";
import {Router} from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const tipoCapacitacionRouter = Router();

tipoCapacitacionRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getTiposCapacitacion)
tipoCapacitacionRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), postTiposCapacitacion)
tipoCapacitacionRouter.put("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), putTiposCapacitacion)
tipoCapacitacionRouter.delete("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deleteTiposCapacitacion)

export default tipoCapacitacionRouter
