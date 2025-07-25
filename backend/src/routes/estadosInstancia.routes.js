import { getEstadosInstancias } from "../controllers/estadosInstancia.controllers.js"
import { Router } from 'express';
import passport from 'passport';
import autorizar from '../utils/autorizar.js';


const estadosInstanciaRouter = Router();

estadosInstanciaRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getEstadosInstancias);

export default estadosInstanciaRouter;