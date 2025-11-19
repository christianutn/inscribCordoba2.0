import { Router } from 'express';
import {getNotasDeAutorizacion } from "../controllers/notasAutorizacion.controller.js"
import passport from 'passport';
import autorizar from '../../../../utils/autorizar.js';



const router = Router();

router.get('/', getNotasDeAutorizacion);


export default router;
