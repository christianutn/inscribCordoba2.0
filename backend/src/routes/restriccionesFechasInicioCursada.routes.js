import {getRestricciones, putRestriccion} from "../domains/Inscribcordoba/api/controllers/restriccionesFechasInicioCursada.controllers.js";
import {Router} from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";


const resticcionesRouter = Router();


resticcionesRouter.get("/fechasInicioCursada", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getRestricciones);

resticcionesRouter.put("/fechasInicioCursada", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), putRestriccion);




export default resticcionesRouter