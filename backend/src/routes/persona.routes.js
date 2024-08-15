import {getPersonas,postPersona,putPersona} from "../controllers/persona.controllers.js";
import {Router} from "express";



const personaRouter = Router();

personaRouter.get("/", getPersonas)
personaRouter.post("/", postPersona)
personaRouter.put("/", putPersona)

export default personaRouter