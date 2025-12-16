import AsistenciaRepository from "../repositories/AsistenciaRepository.js"

export default class AsistenciaService {

    constructor(asistenciaRepository) {
        this.asistenciaRepository = asistenciaRepository;
    }

    async crearVarios(asistenciaData, transacción = null) {
        return await this.asistenciaRepository.crearVarios(asistenciaData, transacción)
    }

    async obtenerCantidadAsistidos(idEvento) {
        return await this.asistenciaRepository.obtenerCantidadAsistidos(idEvento);
    }

    async buscarPorCuilEventoFecha(cuil, id_evento, fecha) {
        return await this.asistenciaRepository.buscarPorCuilEventoFecha(cuil, id_evento, fecha);
    }
}