import {getEventos, getEventoByCod, postEvento } from '../controllers/evento.controllers.js';
import { Router } from 'express';
import passport from 'passport';
import autorizar from '../utils/autorizar.js';


const eventoRouter = Router();

eventoRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getEventos);
eventoRouter.get("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getEventoByCod);
eventoRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), postEvento);
export default eventoRouter;