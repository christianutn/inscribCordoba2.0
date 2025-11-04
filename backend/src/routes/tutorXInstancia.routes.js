import {getTutoresXInstancia} from "../domains/Inscribcordoba/api/controllers/tutorXInstancia.controllers.js";
import { Router } from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const tutorXInstanciaRouter = Router();


tutorXInstanciaRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getTutoresXInstancia)



export default tutorXInstanciaRouter

