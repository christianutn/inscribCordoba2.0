import {getPlataformasDictado, putPlataformaDictado, postPlataformaDictado, deletePlataformaDictado} from "../controllers/plataformaDictado.controllers.js";
import {Router} from "express";


const plataformaDictadoRouter = Router();


plataformaDictadoRouter.get("/", getPlataformasDictado)

plataformaDictadoRouter.put("/", putPlataformaDictado)

plataformaDictadoRouter.post("/", postPlataformaDictado)

plataformaDictadoRouter.delete("/:cod", deletePlataformaDictado)


export default plataformaDictadoRouter