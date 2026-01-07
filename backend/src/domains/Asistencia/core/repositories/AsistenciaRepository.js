import Asistencia from "../../api/models/asistencia.model.js"
import { Op } from "sequelize";

export default class AsistenciaRepository {

    async crearVarios(asistenciaData, transaction = null) {
        return await Asistencia.bulkCreate(asistenciaData, { transaction })
    }

    async crear(data, transaction = null) {
        return await Asistencia.create(data, { transaction });
    }

    async obtenerCantidadAsistidos(id_evento) {
        return await Asistencia.count({ where: { id_evento: id_evento, estado_asistencia: 1 } });
    }

    async buscarPorCuilEventoFecha(cuil, id_evento, fecha) {
        return await Asistencia.findOne({ where: { cuil: cuil, id_evento: id_evento, fecha: fecha } });
    }

    async actualizar(asistenciaData, transaction = null) {
        return await Asistencia.update(asistenciaData, { where: { id: asistenciaData.id }, transaction });
    }

}