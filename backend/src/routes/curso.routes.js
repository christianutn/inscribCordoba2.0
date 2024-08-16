import {getCursos, postCurso, updateCurso, deleteCurso} from "../controllers/curso.controllers.js";
import {Router} from "express";


const cursoRouter = Router();


cursoRouter.get("/", getCursos)

cursoRouter.post("/", postCurso)

cursoRouter.put("/", updateCurso)


cursoRouter.delete("/:cod", deleteCurso)


export default cursoRouter
