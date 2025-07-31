import {getDepartamentos} from "../controllers/departamentos.controller.js";
import { Router } from "express";
import passport from 'passport';
import autorizar from '../utils/autorizar.js';

const departamentoRouter = Router();


departamentoRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getDepartamentos)





export default departamentoRouter