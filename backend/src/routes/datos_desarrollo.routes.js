import { Router } from 'express';
import passport from 'passport';
import autorizar from '../utils/autorizar.js';
import {
    getDatosDesarrollo,
    getDatosDesarrolloById,
    getDatosDesarrolloByCuil,
    postDatosDesarrollo,
    putDatosDesarrollo,
    deleteDatosDesarrollo
} from '../domains/Inscribcordoba/api/controllers/datos_desarrollo.controllers.js';

const datosDesarrolloRouter = Router();

// GET - Obtener todos los registros
datosDesarrolloRouter.get('/',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    getDatosDesarrollo
);

// GET - Obtener registros por CUIL
datosDesarrolloRouter.get('/cuil/:cuil',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    getDatosDesarrolloByCuil
);

// GET - Obtener un registro por ID
datosDesarrolloRouter.get('/:id',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    getDatosDesarrolloById
);

// POST - Crear un nuevo registro
datosDesarrolloRouter.post('/',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    postDatosDesarrollo
);

// PUT - Actualizar un registro
datosDesarrolloRouter.put('/:id',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    putDatosDesarrollo
);

// DELETE - Eliminar un registro
datosDesarrolloRouter.delete('/:id',
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    deleteDatosDesarrollo
);

export default datosDesarrolloRouter;
