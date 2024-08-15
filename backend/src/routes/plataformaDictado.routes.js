import {getPlataformasDictado, putPlataformaDictado} from "../controllers/plataformaDictado.controllers.js";
import {Router} from "express";


const plataformaDictadoRouter = Router();


plataformaDictadoRouter.get("/", getPlataformasDictado)

plataformaDictadoRouter.put("/", putPlataformaDictado)


export default plataformaDictadoRouter