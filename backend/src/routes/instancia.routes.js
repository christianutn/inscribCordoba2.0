import {getInstancias, postInstancia} from "../controllers/instancia.controllers.js";
import { Router } from "express";

const instanciaRouter = Router();


instanciaRouter.get("/", getInstancias)

instanciaRouter.post("/", postInstancia)



export default instanciaRouter
