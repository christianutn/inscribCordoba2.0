
import { Router } from 'express';
import { consultarAsistencia, registrarAsistencia } from '../controllers/asistencias.controllers.js';

const router = Router();


// Consultar asistencia (o datos de participante)
router.get('/:cuil/:id_evento', consultarAsistencia);

// Confirmar asistencia (Registrar)
router.post('/', registrarAsistencia);

// Otras rutas existentes (si las hay, aunque el archivo estaba vacío)
// ...

export default router;
