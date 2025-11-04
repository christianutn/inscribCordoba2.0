import {getPersonas,postPersona,putPersona, deletePersona} from "../domains/Inscribcordoba/api/controllers/persona.controllers.js";
import {Router} from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";



const personaRouter = Router();

personaRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getPersonas)
personaRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), postPersona)
personaRouter.put("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), putPersona)
personaRouter.delete("/:cuil", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deletePersona)

export default personaRouter