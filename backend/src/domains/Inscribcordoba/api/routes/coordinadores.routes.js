import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../../../../middlewares/validations/validarCampos.js';
import { createCoordinador, getCoordinadores, getCoordinadorById, updateCoordinador, deleteCoordinador } from '../controllers/coordinadores.controllers.js';

const router = Router();

router.get('/', getCoordinadores);
router.get('/:id', getCoordinadorById);
router.post('/', [
    check('cuil', 'El CUIL es obligatorio').not().isEmpty(),
    check('nota_autorizacion_id', 'El ID de la nota de autorización es obligatorio').not().isEmpty(),
    validarCampos
], createCoordinador);
router.put('/:id', [
    check('cuil', 'El CUIL es obligatorio').not().isEmpty(),
    check('nota_autorizacion_id', 'El ID de la nota de autorización es obligatorio').not().isEmpty(),
    validarCampos
], updateCoordinador);
router.delete('/:id', deleteCoordinador);

export default router;
