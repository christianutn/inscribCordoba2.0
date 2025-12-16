import { Router } from 'express';
import { getNotasDeAutorizacion, registrarNotaDeAutorizacion, autorizarNotaDeAutorizacion } from "../controllers/notasAutorizacion.controller.js"

import passport from 'passport';
import autorizar from '../../../../utils/autorizar.js';
import AppError from '../../../../utils/appError.js';
import ManejadorArchivos from '../../../../services/ManejadorDeArchivo.js';



const router = Router();
const manejadorArchivos = new ManejadorArchivos("nota_autorizacion");



router.get('/', getNotasDeAutorizacion);

router.put('/',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    autorizarNotaDeAutorizacion
)

router.post('/subir-nota-de-autorizacion',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    manejadorArchivos.middleware(),
    registrarNotaDeAutorizacion
)






export default router;
