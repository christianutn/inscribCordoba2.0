import { Transaction } from 'sequelize';
import ParticipanteRepository from '../repositories/ParticipanteRepository.js'

export default class ParticipanteService {

    constructor(participanteRepository) {
        this.participanteRepository = participanteRepository;
    }


    async crearParticipante(participanteData, transaction = null) {

        // validar partipanteData debe tener nombre, apellido, cuil

        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        if (isLocalTransaction) {
            await t.commit();
        }

        try {
            if (!participanteData.nombres || !participanteData.apellido || !participanteData.cuil) {
                throw new Error("El participante debe tener nombre, apellido y cuil");
            }

            return await this.participanteRepository.crear(participanteData, transaction);
        } catch (error) {

            if (isLocalTransaction) {
                await t.rollback();
            }

            throw new Error("Error al crear el participante: " + error.message);
        }
    }


    async buscarParticipantePorCuil(cuil) {

        return await this.participanteRepository.existe(cuil);
    }
}