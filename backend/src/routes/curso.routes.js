import {getCursos, postCurso} from "../controllers/curso.controllers.js";
import {Router} from "express";


const cursoRouter = Router();


cursoRouter.get("/", getCursos)

cursoRouter.post("/", postCurso)


export default cursoRouter
