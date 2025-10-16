// core/repositories/InscripcionRepository.js
import Inscripcion from '../../api/models/inscripcion.model.js';

export default class InscripcionRepository {
    async crear(inscripcionData, transaction = null) {
        
        return await Inscripcion.create(inscripcionData, { transaction });
    }

    async crearVarios(inscripcionesData, transaction = null) {
        return await Inscripcion.bulkCreate(inscripcionesData, { transaction });
    }
}
