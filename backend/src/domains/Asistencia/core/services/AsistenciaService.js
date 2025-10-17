import AsistenciaRepository from "../repositories/AsistenciaRepository.js"

export default class AsistenciaService {

    constructor() {
        this.asistenciaRepository = new AsistenciaRepository()
    }
    
    async crearVarios (asistenciaData, transacción = null) {
        return await this.asistenciaRepository.crearVarios(asistenciaData, transacción)
    }
}