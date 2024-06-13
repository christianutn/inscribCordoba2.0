import {getPersonas, postPersona} from "../controllers/persona.controllers.js";
import {Router} from "express";



const personaRouter = Router();

personaRouter.get("/", getPersonas)
personaRouter.post("/", postPersona)

export default personaRouter