// core/repositories/InscripcionRepository.js
import InscripcionRepository from '../repositories/InscipcionRepository.js';
export default class InscripcionService {

    constructor(inscripcionRepository) {
        this.inscripcionRepository = inscripcionRepository;
    }

    async crear(inscripcionData, transaction = null) {
        try {

            const inscripcion = await this.inscripcionRepository.crear(inscripcionData, transaction);
            return inscripcion;
        } catch (err) {
            console.error("Error en el servicio al crear la inscripción:", err.message);
            throw err;
        }
    }

}
