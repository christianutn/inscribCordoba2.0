import {getTutoresXInstancia} from "../controllers/tutorXInstancia.controllers.js";
import { Router } from "express";

const tutorXInstanciaRouter = Router();


tutorXInstanciaRouter.get("/", getTutoresXInstancia)



export default tutorXInstanciaRouter

