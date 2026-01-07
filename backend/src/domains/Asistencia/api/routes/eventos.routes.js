import { Router } from "express";
import EventosController from "../controllers/eventos.controller.js";
import passport from "passport";
import autorizar from "../../../../utils/autorizar.js";

// Import Services
import EventoService from "../../core/services/EventoService.js";
import AsistenciaService from "../../core/services/AsistenciaService.js";
import InscripcionService from "../../core/services/InscripcionService.js";
import EventoRepository from "../../core/repositories/EventoRepository.js";
import AsistenciaRepository from "../../core/repositories/AsistenciaRepository.js";
import InscripcionRepository from "../../core/repositories/InscipcionRepository.js";
// import ObtenerListaEventosUseCase from "../../useCases/ObtenerListaEventosUseCase.js";

const router = Router();

// Instantiate repositories
const eventoRepository = new EventoRepository();
const asistenciaRepository = new AsistenciaRepository();
const inscripcionRepository = new InscripcionRepository();

// Instantiate Services with Repositories
const asistenciaService = new AsistenciaService(asistenciaRepository);
const inscripcionService = new InscripcionService(inscripcionRepository);

// EventoService depends on InscripcionService and AsistenciaService for stats
const eventoService = new EventoService(eventoRepository, inscripcionService, asistenciaService);

// Instantiate controller with dependencies
const eventosController = new EventosController(eventoService);

// Bind the method to the controller instance to preserve 'this' context
router.get("/listado",
    passport.authenticate("jwt", { session: false }),
    autorizar(['ADM', 'REF', 'GA']), // Assuming these roles based on context, user can adjust if needed
    eventosController.obtenerListaEventos.bind(eventosController)

);

router.post("/manual",
    passport.authenticate("jwt", { session: false }),
    autorizar(['ADM', 'REF', 'GA']), // Assuming these roles based on context, user can adjust if needed
    eventosController.crearEvento.bind(eventosController)
)

router.get("/detalle-evento-con-asistencia/:id_evento",
    passport.authenticate("jwt", { session: false }),
    autorizar(['ADM', 'REF', 'GA']), // Assuming these roles based on context, user can adjust if needed
    eventosController.obtenerDetalleEventoConAsistencia.bind(eventosController)
)







export default router;
