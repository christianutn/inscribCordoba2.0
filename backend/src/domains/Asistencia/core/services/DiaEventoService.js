import DiaEventoRepository from "../repositories/DiaEventoRepository.js";


export default class DiaEventoService {

 

    async crear(data, transaction = null) {
        return await DiaEventoRepository.create({fecha: data.fecha}, { transaction });
    }

}