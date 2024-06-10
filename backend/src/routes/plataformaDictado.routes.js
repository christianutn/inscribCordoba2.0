import {getPlataformasDictado} from "../controllers/plataformaDictado.controllers.js";
import {Router} from "express";


const plataformaDictadoRouter = Router();


plataformaDictadoRouter.get("/", getPlataformasDictado)


export default plataformaDictadoRouter