
import AppError from "../../../../utils/appError.js";

export default class EventosController {
    constructor(obtenerListaEventosUseCase) {
        this.obtenerListaEventosUseCase = obtenerListaEventosUseCase;
    }

    async obtenerListaEventos(req, res, next) {
        try {
            const eventos = await this.obtenerListaEventosUseCase.ejecutar();
            res.json(eventos);
        } catch (error) {
            throw new AppError(error.message || "Error al obtener la lista de eventos", 500);
        }
    }
}
