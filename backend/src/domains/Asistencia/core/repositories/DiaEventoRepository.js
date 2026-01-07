import DiaEvento from '../../api/models/diaEvento.model.js'

export default class DiaEventoRepository {

    async crear(data, transaction = null) {
        return await DiaEvento.create(data, { transaction });

    }

    async crearVarios(data, transaction = null) {
        return await DiaEvento.bulkCreate(data, { transaction });
    }

    async buscarPorEvento(id_evento, transaction = null) {
        return await DiaEvento.findAll({ where: { id_evento }, transaction });
    }

    async buscarPorEventoYFecha(id_evento, fecha, transaction = null) {
        return await DiaEvento.findOne({ where: { id_evento, fecha }, transaction });
    }

}