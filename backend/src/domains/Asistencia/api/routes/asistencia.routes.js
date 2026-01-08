import { Router } from 'express';
import { consultarAsistencia, registrarAsistencia, obtenerListaParticipantes, obtenerAsistenciaPorEvento, registrarAsistenciaManual } from '../controllers/asistencias.controllers.js';
import { publicApiLimiter } from '../../../../middlewares/rateLimiter.js';
import passport from "passport";
import autorizar from "../../../../utils/autorizar.js";

const router = Router();


// Obtener lista de participantes por evento
router.get('/operaciones/participantes',
    passport.authenticate("jwt", { session: false }),
    autorizar(["ADM", "GA", "LOG"]),
    obtenerListaParticipantes);

// Obtener asistencia por evento y cuil
router.get('/obtenerListadoDeParticipantesPorEvento',
    passport.authenticate("jwt", { session: false }),
    autorizar(["ADM", "GA", "LOG"]),
    obtenerAsistenciaPorEvento);

// Consultar asistencia (o datos de participante) USA API DE CIDI
router.get('/consultar/:cuil/:id_evento', publicApiLimiter, consultarAsistencia);

// Confirmar asistencia (Registrar) USA API DE CIDI
router.post('/confirmar', publicApiLimiter, registrarAsistencia);

// Registrar asistencia manual
router.put('/manual',
    passport.authenticate("jwt", { session: false }),
    autorizar(["ADM", "GA", "LOG"]),
    registrarAsistenciaManual);


export default router;
