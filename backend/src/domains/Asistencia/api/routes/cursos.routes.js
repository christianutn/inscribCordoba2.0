import { Router } from "express";
import CursoController from "../controllers/cursos.controllers.js";
const router = Router();

const cursoController = new CursoController();

router.get("/",
    cursoController.getCursos);

export default router;