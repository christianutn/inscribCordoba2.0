import CidiService from "../../../services/CidiService.js";
import AsistenciaRepository from "../core/repositories/AsistenciaRepository.js";
import AsistenciaService from "../core/services/AsistenciaService.js"

import sequelize from "../../../config/database.js";

export default class RegistrarAsistenciaUseCase {

    constructor({
        asistenciaService,
        CidiService,
        participanteService
    }) {
        this.asistenciaService = asistenciaService;
        this.CidiService = CidiService;
        this.participanteService = participanteService;
    }

    async ejecutar(cuil, id_evento, fecha) {

        const transaction = await sequelize.transaction();

        // Buscar en tabla de asistencia
        const asistencia = await this.asistenciaService.buscarPorCuilEventoFecha(cuil, id_evento, fecha);

        // Si existe en tabla de asistencia marcar como asistido
        if (asistencia) {
            await this.asistenciaService.actualizar({
                id: asistencia.id,
                estado_asistencia: 1
            }, transaction);

        } else {
            // Sino existe el cuil en asistencia buscar datos por Cidi
            const participante = await this.CidiService.getPersonaEnCidiPor(cuil)

            // Buscamos si existe en la tabla de participantes
            // Si existe, actualizamos participante
            // Si no existe creamos nuevo participante
        }


        //Consulta datos de dias para el evento

        // Crear inscripcion y asistencia para el participante

        // marcamos asistencia para el dia día actual
    }
}