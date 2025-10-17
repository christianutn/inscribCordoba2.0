import Asistencia from "../../api/models/asistencia.model.js"

export default class AsistenciaRepository {

    async crearVarios (asistenciaData, transaction = null) {
        return await Asistencia.bulkCreate(asistenciaData, { transaction })
    }

}