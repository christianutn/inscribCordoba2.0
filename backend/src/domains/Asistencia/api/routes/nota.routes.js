import express from "express";
import { crearOActualizarNota, getNotaPorCuilYEvento } from "../controllers/notas.controllers.js";

const router = express.Router();

router.get('/:cuil/:id_evento', getNotaPorCuilYEvento);
router.post('/:cuil/:id_evento', crearOActualizarNota);

export default router;
