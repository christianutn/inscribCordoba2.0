import { Router } from "express";
import CursoController from "../controllers/cursos.controllers.js";
import passport from "passport";
import autorizar from "../../../../utils/autorizar.js";
const router = Router();

const cursoController = new CursoController();

router.get("/",
    passport.authenticate("jwt", { session: false }),
    autorizar(["ADM", "REF", "GA"]),
    cursoController.getCursos);

export default router;