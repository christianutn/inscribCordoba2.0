import DiaEvento from '../../api/models/diaEvento.model.js'

export default class DiaEventoRepository {

    async crear(data, transaction = null) {
        return await DiaEvento.create(data, { transaction });
    
    }

}