// core/repositories/InscripcionRepository.js
import Inscripcion from '../../api/models/inscripcion.model.js';

export default class InscripcionRepository {
    async crear(inscripcionData, transaction = null) {

        return await Inscripcion.create(inscripcionData, { transaction });
    }

    async crearVarios(inscripcionesData, transaction = null) {
        return await Inscripcion.bulkCreate(inscripcionesData, { transaction });
    }

    async obtenerCantidadInscriptos(id_evento) {
        return await Inscripcion.count({ where: { id_evento: id_evento } });
    }

    async buscarPorCuilYEvento(cuil, id_evento, options = {}) {
        return await Inscripcion.findOne({
            where: { cuil, id_evento },
            ...options
        });
    }

    async listarPorEvento(id_evento, options = {}) {
        return await Inscripcion.findAll({
            where: { id_evento },
            ...options
        });
    }
}
