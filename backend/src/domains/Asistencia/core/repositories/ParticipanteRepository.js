import Participante from '../../api/models/participante.model.js'
import { Op } from 'sequelize';


// Crear un repositori para participante

export default class ParticipanteRepository {
    
    async crear(participanteData, transaction = null) {
        try {
            const participante = await Participante.create(participanteData, { transaction });
            return participante;
        } catch (error) {
            throw error;
        }
    }

    async existe(cuil) {
        return await Participante.findOne({ where: { cuil: cuil } });
    }

    async buscarPorCuils(cuils, transaction = null) {
        try {
            return await Participante.findAll({
                where: {
                    cuil: {
                        [Op.in]: cuils
                    }
                },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    async crearVarios(participantesData, transaction = null) {
        try {
            const participantes = await Participante.bulkCreate(participantesData, { transaction });
            return participantes;
        } catch (error) {
            throw error;
        }
    }

}