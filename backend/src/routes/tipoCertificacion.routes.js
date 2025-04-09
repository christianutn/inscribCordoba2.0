import {getTiposCertificacion, getTipoCertificacionByCod} from "../controllers/tipoCertificacion.controllers.js";
import {Router} from "express";

import autorizar from "../utils/autorizar.js"
import passport from "passport";

const tipoCertificacionRouter = Router();

tipoCertificacionRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getTiposCertificacion)
tipoCertificacionRouter.get("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getTipoCertificacionByCod)

export default tipoCertificacionRouter