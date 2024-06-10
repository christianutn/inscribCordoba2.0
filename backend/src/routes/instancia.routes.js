import {getInstancias} from "../controllers/instancia.controllers.js";
import { Router } from "express";

const instanciaRouter = Router();


instanciaRouter.get("/", getInstancias)



export default instanciaRouter
