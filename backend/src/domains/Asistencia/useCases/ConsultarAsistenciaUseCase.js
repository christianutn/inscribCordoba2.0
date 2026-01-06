
import Inscripcion from '../api/models/inscripcion.model.js';
import Participante from '../api/models/participante.model.js';
import CidiService from '../../../services/CidiService.js';

class ConsultarAsistenciaUseCase {
    constructor() {
        this.cidiService = new CidiService();
    }

    async ejecutar(cuil, id_evento) {
        try {
            // 1. Buscar en asistencia_inscripciones
            const inscripcion = await Inscripcion.findOne({
                where: {
                    cuil: cuil,
                    id_evento: id_evento
                },
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
                // Si Cidi no encuentra o da error, pero no falló la request HTTP (ej: cuil inexistente)
                // Lanzamos error o devolvemos nulo?
                // El requerimiento dice: "El backend debe enviar nombre, apellido y cuil."
                // Si no existe en CIDI, no podemos enviar nombre y apellido.
                // Retornamos error.
                throw new Error('Persona no encontrada en inscribirse ni en CIDI');
            }

        } catch (error) {
            console.error("Error en ConsultarAsistenciaUseCase:", error);
            throw error;
        }
    }
}

export default ConsultarAsistenciaUseCase;
