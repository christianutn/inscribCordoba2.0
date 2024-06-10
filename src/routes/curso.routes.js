import {getCursos} from "../controllers/curso.controllers.js";
import {Router} from "express";


const cursoRouter = Router();


cursoRouter.get("/", getCursos)


export default cursoRouter
