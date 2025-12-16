// core/repositories/EventoRepository.js
import Evento from '../../api/models/eventoAsistencia.model.js';
import sequelize from '../../../../config/database.js';
import CursoAsistencia from '../../api/models/curso.model.js';

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

    async obtenerTodos() {
        return await Evento.findAll({
            include: [{
                model: CursoAsistencia,
                as: 'curso'
            }]
        });
    }


}
