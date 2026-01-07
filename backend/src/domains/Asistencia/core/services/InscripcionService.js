// core/repositories/InscripcionRepository.js
import InscripcionRepository from '../repositories/InscipcionRepository.js';
import Participante from '../../api/models/participante.model.js';
import Nota from '../../api/models/nota.model.js';
import CidiService from '../../../../services/CidiService.js';
import AppError from '../../../../utils/appError.js';

export default class InscripcionService {

    constructor(inscripcionRepository) {
        this.inscripcionRepository = inscripcionRepository;
        this.cidiService = new CidiService();
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
                throw new AppError("Todas las inscripciones deben tener cuil y id_evento", 400);
            }
            return await this.inscripcionRepository.crearVarios(inscripcionesData, transaction);
        } catch (err) {
            console.error("Error en el servicio al crear varias inscripciones:", err.message);
            throw err;
        }
    }

    async consultarEstadoInscripcion(cuil, id_evento) {
        try {
            // 1. Buscar en asistencia_inscripciones
            const inscripcion = await this.inscripcionRepository.buscarPorCuilYEvento(cuil, id_evento, {
                include: [
                    {
                        model: Participante,
                        as: 'participante',
                        attributes: ['nombres', 'apellido', 'cuil']
                    }
                ]
            });

            // 2.1 Si existe, devolver datos del participante
            if (inscripcion && inscripcion.participante) {
                return {
                    nombre: inscripcion.participante.nombres,
                    apellido: inscripcion.participante.apellido,
                    cuil: inscripcion.participante.cuil,
                    existe: true
                };
            }

            // 2.2 Si no existe, consultar CIDI
            const personaCidi = await this.cidiService.getPersonaEnCidiPor(cuil);

            const respuesta = personaCidi.respuesta || personaCidi.Respuesta;

            if (respuesta && (respuesta.resultado === 'OK' || respuesta.Resultado === 'OK')) {

                const nombre = personaCidi.Nombre;
                const apellido = personaCidi.Apellido;

                return {
                    nombre: nombre,
                    apellido: apellido,
                    cuil: cuil,
                    existe: false
                };
            } else {
                throw new AppError('Persona no encontrada en inscribirse ni en CIDI', 404);
            }

        } catch (error) {
            console.error("Error en InscripcionService.consultarEstadoInscripcion:", error);
            throw error;
        }
    }

    async listarParticipantesConNotas(id_evento) {
        try {
            // Buscar todas las inscripciones para este evento, incluyendo participante
            const inscripciones = await this.inscripcionRepository.listarPorEvento(id_evento, {
                include: [
                    {
                        model: Participante,
                        as: 'participante',
                        attributes: ['cuil', 'nombres', 'apellido', 'correo_electronico', 'reparticion', 'es_empleado']
                    }
                ]
            });

            // Para cada inscripción, buscar su nota (si existe)
            const participantesConNotas = await Promise.all(
                inscripciones.map(async (inscripcion) => {
                    // Verificar que el participante existe
                    if (!inscripcion.participante) {
                        return null;
                    }

                    const nota = await Nota.findOne({
                        where: {
                            id_evento: id_evento,
                            cuil: inscripcion.cuil
                        }
                    });

                    return {
                        cuil: inscripcion.participante.cuil,
                        nombres: inscripcion.participante.nombres,
                        apellido: inscripcion.participante.apellido,
                        correo_electronico: inscripcion.participante.correo_electronico,
                        reparticion: inscripcion.participante.reparticion,
                        es_empleado: inscripcion.participante.es_empleado,
                        nota: nota ? nota.nota : null
                    };
                })
            );

            // Filtrar participantes nulos
            return participantesConNotas.filter(p => p !== null);

        } catch (error) {
            console.error("Error en InscripcionService.listarParticipantesConNotas:", error);
            throw error;
        }
    }
}
