
import { Router } from 'express';
import { consultarAsistencia, registrarAsistencia, obtenerListaParticipantes, obtenerAsistenciaPorEvento, registrarAsistenciaManual } from '../controllers/asistencias.controllers.js';

const router = Router();


// Obtener lista de participantes por evento
router.get('/participantes', obtenerListaParticipantes);

// Obtener asistencia por evento y cuil
router.get('/', obtenerAsistenciaPorEvento);

// Consultar asistencia (o datos de participante)
router.get('/:cuil/:id_evento', consultarAsistencia);

// Confirmar asistencia (Registrar)
router.post('/', registrarAsistencia);

// Registrar asistencia manual
router.put('/manual', registrarAsistenciaManual);



export default router;
