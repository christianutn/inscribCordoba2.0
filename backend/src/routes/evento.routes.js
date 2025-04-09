import {getEventos, getEventoByCod, postEvento } from '../controllers/evento.controllers.js';
import { Router } from 'express';
import passport from 'passport';
import autorizar from '../utils/autorizar.js';


const eventoRouter = Router();

eventoRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getEventos);
eventoRouter.get("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getEventoByCod);
eventoRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), postEvento);
export default eventoRouter;