import {getPersonas,postPersona,putPersona, deletePersona} from "../controllers/persona.controllers.js";
import {Router} from "express";



const personaRouter = Router();

personaRouter.get("/", getPersonas)
personaRouter.post("/", postPersona)
personaRouter.put("/", putPersona)
personaRouter.delete("/:cuil", deletePersona)

export default personaRouter