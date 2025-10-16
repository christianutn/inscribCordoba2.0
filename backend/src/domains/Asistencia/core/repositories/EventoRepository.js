// core/repositories/EventoRepository.js
import Evento from '../../api/models/Evento.model.js';
import sequelize from '../../../../config/database.js';

export default class EventoRepository {

    async crear(EventoData, t) {
        return await Evento.create(EventoData, { transaction: t });
    }

    async actualizar(EventoData, transaction = null) {
        return await Evento.update(EventoData, { transaction });
    }

    async existe(eventoData) {
        return await Evento.findOne({ where: { id: eventoData.id } });
    }
}
