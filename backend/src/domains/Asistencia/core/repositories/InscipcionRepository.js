// core/repositories/InscripcionRepository.js
import Inscripcion from '../../api/models/inscripcion.model.js';

export default class InscripcionRepository {
    async crear(inscripcionData, transaction = null) {
        
        return await Inscripcion.create(inscripcionData, { transaction });
    }

}
