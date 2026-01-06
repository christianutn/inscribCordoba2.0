import Inscripcion from "../api/models/inscripcion.model.js";
import Participante from "../api/models/participante.model.js";
import Nota from "../api/models/nota.model.js";

class ObtenerListaParticipantesPorEventoUseCase {
    constructor() { }

    async ejecutar(id_evento) {
        try {
            // Buscar todas las inscripciones para este evento, incluyendo participante y nota
            const inscripciones = await Inscripcion.findAll({
                where: {
                    id_evento: id_evento
                },
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
                        console.warn(`Participante no encontrado para CUIL: ${inscripcion.cuil}`);
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
            console.error("Error en ObtenerListaParticipantesPorEventoUseCase:", error);
            throw error;
        }
    }
}

export default ObtenerListaParticipantesPorEventoUseCase;
