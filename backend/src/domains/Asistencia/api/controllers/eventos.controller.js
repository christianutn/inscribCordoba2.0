
import AppError from "../../../../utils/appError.js";

export default class EventosController {
    constructor(eventoService) {
        this.eventoService = eventoService;
    }

    async obtenerListaEventos(req, res, next) {
        try {
            const eventos = await this.eventoService.obtenerTodosConEstadisticas();
            res.json(eventos);
        } catch (error) {
            next(error);
        }
    }

    async crearEvento(req, res, next) {
        try {
            const evento = await this.eventoService.crearEvento(req.body);
            res.status(201).json(evento);
        } catch (error) {
            next(error);
        }
    }

    async obtenerDetalleEventoConAsistencia(req, res, next) {
        try {
            const id_evento = req.params.id_evento;
            const evento = await this.eventoService.obtenerDetalleEventoConAsistencia(id_evento);
            res.json(evento);
        } catch (error) {
            next(error);
        }
    }
}
