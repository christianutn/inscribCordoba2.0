// core/repositories/InscripcionRepository.js
import InscripcionRepository from '../repositories/InscipcionRepository.js';
export default class InscripcionService {

    constructor(inscripcionRepository) {
        this.inscripcionRepository = inscripcionRepository;
    }


    async obtenerCantidadInscriptos(idEvento) {
        return await this.inscripcionRepository.obtenerCantidadInscriptos(idEvento);
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

    async crearVarios(inscripcionesData, transaction = null) {
        try {
            // Optional: Add validation for each item
            const inscripcionesSonValidas = inscripcionesData.every(i => i.cuil && i.id_evento);
            if (!inscripcionesSonValidas) {
                throw new Error("Todas las inscripciones deben tener cuil y id_evento");
            }
            return await this.inscripcionRepository.crearVarios(inscripcionesData, transaction);
        } catch (err) {
            console.error("Error en el servicio al crear varias inscripciones:", err.message);
            throw err;
        }
    }
}
