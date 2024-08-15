import {getCursos, postCurso, updateCurso} from "../controllers/curso.controllers.js";
import {Router} from "express";


const cursoRouter = Router();


cursoRouter.get("/", getCursos)

cursoRouter.post("/", postCurso)

cursoRouter.put("/", updateCurso)


export default cursoRouter
