import CidiService from "../../../services/CidiService.js";
import AsistenciaRepository from "../core/repositories/AsistenciaRepository.js";
import AsistenciaService from "../core/services/AsistenciaService.js"



export default class RegistrarAsistenciaUseCase {

    async ejecutar(cuil, nroEvento, diaAsistencia) {

        // Buscar en tabla de asistencia

        // Si existe en tabla de asistencia marcar como asistido

        // Sino existe el cuil en asistencia buscar datos por Cidi

        // Buscamos si existe en la tabla de participantes
        // Si existe, actualizamos participante
        // Si no existe creamos nuevo participante

        //Consulta datos de dias para el evento

        // Crear inscripcion y asistencia para el participante
        
        // marcamos asistencia para el dia día actual
    }
}