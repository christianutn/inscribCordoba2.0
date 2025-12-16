import { Router } from 'express';
import { getTodosLosUltimosEstadoDeNotaDeAutorizacion, rechazarNotaDeAutorizacion } from "../controllers/cambios_estados_notas_de_autorizacion.controller.js"
import passport from 'passport';
import autorizar from '../../../../utils/autorizar.js';



const router = Router();
router.get('/obtener-ultimo-estado-de-nota-de-autorizacion',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    getTodosLosUltimosEstadoDeNotaDeAutorizacion)

router.post('/rechazar-nota-de-autorizacion',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    rechazarNotaDeAutorizacion)

export default router;
