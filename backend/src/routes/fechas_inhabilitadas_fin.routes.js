import express from "express";
import { getFechasInhabilitadasFin, postFechasInhabilitadasFin, deleteFechasInhabilitadasFin } from "../domains/Inscribcordoba/api/controllers/fechas_inhabilitadas_fin.controller.js";
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const router = express.Router();

router.get("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(["ADM", "REF", "GA"]),
    getFechasInhabilitadasFin);
router.post("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(["ADM"]),
    postFechasInhabilitadasFin);
router.delete("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(["ADM"]),
    deleteFechasInhabilitadasFin);

export default router;
