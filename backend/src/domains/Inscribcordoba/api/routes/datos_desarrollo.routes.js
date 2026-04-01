import { Router } from 'express';
import {
    getDatosDesarrollo,
    postDatosDesarrollo,
    putDatosDesarrollo,
    deleteDatosDesarrollo
} from "../controllers/datos_desarrollo.controllers.js";
import passport from 'passport';
import autorizar from '../../../../utils/autorizar.js';

const router = Router();

router.get('/',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    getDatosDesarrollo
);

router.post('/',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    postDatosDesarrollo
);

router.put('/:id',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    putDatosDesarrollo
);

router.delete('/:id',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    deleteDatosDesarrollo
);

export default router;
