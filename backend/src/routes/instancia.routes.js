import {getInstancias, postInstancia, deleteInstancia} from "../controllers/instancia.controllers.js";
import { Router } from "express";

const instanciaRouter = Router();


instanciaRouter.get("/", getInstancias)

instanciaRouter.post("/", postInstancia)

instanciaRouter.delete("/", deleteInstancia)



export default instanciaRouter
