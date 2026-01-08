import express from "express";
import { crearOActualizarNota, getNotaPorCuilYEvento } from "../controllers/notas.controllers.js";
import passport from "passport";
import autorizar from "../../../../utils/autorizar.js";

const router = express.Router();

router.get('/:cuil/:id_evento',
    passport.authenticate("jwt", { session: false }),
    autorizar(["ADM", "LOG", "GA"]),
    getNotaPorCuilYEvento);
router.post('/:cuil/:id_evento',
    passport.authenticate("jwt", { session: false }),
    autorizar(["ADM", "LOG", "GA"]),
    crearOActualizarNota);

export default router;
