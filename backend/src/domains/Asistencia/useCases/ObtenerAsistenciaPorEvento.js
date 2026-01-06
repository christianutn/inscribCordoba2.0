import AsistenciaDiaEvento from "../api/models/diaEvento.model.js";
import Asistencia from "../api/models/asistencia.model.js";

/**
 * Use case to obtain attendance status per day for a participant in an event.
 * Expected query params: id_evento (number) and cuil (string).
 * Returns an object where each key is a date (YYYY-MM-DD) and value is 1 (asistido) or 0 (no asistido).
 */
class ObtenerAsistenciaPorEvento {
    async ejecutar(id_evento, cuil) {
        try {
            // 1. Get all days for the event
            const dias = await AsistenciaDiaEvento.findAll({
                where: { id_evento },
                attributes: ["fecha"]
            });

            const resultado = {};

            // 2. For each day, check attendance for the given cuil
            for (const dia of dias) {
                const asistencia = await Asistencia.findOne({
                    where: {
                        id_evento,
                        fecha: dia.fecha,
                        cuil
                    },
                    attributes: ["estado_asistencia"]
                });
                // estado_asistencia expected to be 1 or 0; default to 0 if not found
                const estado = asistencia ? asistencia.estado_asistencia : 0;

                // dia.fecha is DATEONLY (string 'YYYY-MM-DD')
                const fechaStr = typeof dia.fecha === 'string' ? dia.fecha : new Date(dia.fecha).toISOString().split('T')[0];
                resultado[fechaStr] = estado;
            }

            return resultado;
        } catch (error) {
            console.error("Error en ObtenerAsistenciaPorEvento:", error);
            throw error;
        }
    }
}

export default ObtenerAsistenciaPorEvento;
