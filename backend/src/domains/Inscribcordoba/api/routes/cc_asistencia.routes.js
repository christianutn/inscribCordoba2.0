import { Router } from "express";
import passport from "passport";
import autorizar from "../../../../utils/autorizar.js";
import { getEventos, getEventoById, createEvento, updateEvento, deleteEvento } from "../controllers/cc_asistencia_eventos.controller.js";
import { getInscriptosByEvento, confirmarAsistencia, updateNotaYAsistencia, cargarInscriptosMasivos } from "../controllers/cc_asistencia_inscriptos.controller.js";
import { createOrUpdateParticipantesG, createOrUpdateParticipantesMasivos } from "../controllers/cc_asistencia_participantes.controller.js";
import CidiService from '../../../../services/CidiService.js';
import { publicApiLimiter } from "../../../../middlewares/rateLimiter.js";


const router = Router();
const cidiService = new CidiService();

// ======== EVENTOS ========
router.get("/eventos", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), getEventos);
router.get("/eventos/:id", getEventoById); // Endpoint público para que el escáner QR cargue la info
router.post("/eventos", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), createEvento);
router.put("/eventos/:id", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), updateEvento);
router.delete("/eventos/:id", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), deleteEvento);


// ======== INSCRIPTOS ========
// List of inscribed for an event
router.get("/inscriptos/evento/:evento_id", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), async (req, res) => {
    // The previous implementation mapped incorrectly. Let's use the controller function
    await getInscriptosByEvento(req, res);
});

// Update specific note and attendance
router.put("/inscriptos/:id", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), updateNotaYAsistencia);

// Confirm Attendance (QR or Manual lookup) -> Open for general users without auth if triggered via QR
router.post("/inscriptos/confirmar", publicApiLimiter, confirmarAsistencia);

// Carga Masiva (Excel template upload)
router.post("/inscriptos/masivos", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), cargarInscriptosMasivos);


// ======== PARTICIPANTES ========
// Add one manual participant from Cuil lookup - Público para que el escáner registre gente nueva
router.post("/participantes/upsert", createOrUpdateParticipantesG);

// Upsert massively from Excel
router.post("/participantes/masivos", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), createOrUpdateParticipantesMasivos);

// Look up from Cidi via CIDI service
router.get("/participantes/cidi/:cuil", publicApiLimiter, async (req, res) => {
    try {
        const { cuil } = req.params;
        const personaCidi = await cidiService.getPersonaEnCidiPor(cuil);
        const respuesta = personaCidi.respuesta || personaCidi.Respuesta;
        if (respuesta && (respuesta.resultado === 'OK' || respuesta.Resultado === 'OK')) {
            // Solo devolver nombre, apellido y cuil por seguridad
            return res.status(200).json({
                nombre: personaCidi.Nombre,
                apellido: personaCidi.Apellido,
                cuil: cuil
            });
        } else {
            return res.status(404).json({ message: "Persona no encontrada en CIDI" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
