import {getPersonas} from "../controllers/persona.controllers.js";
import {Router} from "express";


const personaRouter = Router();

personaRouter.get("/", getPersonas)


export default personaRouter