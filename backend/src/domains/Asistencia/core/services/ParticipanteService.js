import { Transaction } from 'sequelize';
import ParticipanteRepository from '../repositories/ParticipanteRepository.js'
import sequelize from '../../../../config/database.js';

export default class ParticipanteService {

    constructor(participanteRepository) {
        this.participanteRepository = participanteRepository;
    }


    async crearParticipante(participanteData, transaction = null) {

        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            if (!participanteData.nombres || !participanteData.apellido || !participanteData.cuil) {
                throw new Error("El participante debe tener nombre, apellido y cuil");
            }

            const result = await this.participanteRepository.crear(participanteData, t);

            if (isLocalTransaction) {
                await t.commit();
            }
            return result;
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

    async buscarParticipantesPorCuils(cuils, transaction = null) {
        try {
            if (!cuils || cuils.length === 0) {
                return [];
            }
            return await this.participanteRepository.buscarPorCuils(cuils, transaction);
        } catch (error) {
            throw new Error("Error al buscar participantes por CUILs: " + error.message);
        }
    }

    async crearVarios(participantesData, transaction = null) {
        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            const sonParticipantesValidos = participantesData.every(p => p.nombres && p.apellido && p.cuil);
            if (!sonParticipantesValidos) {
                throw new Error("Todos los participantes deben tener nombre, apellido y cuil");
            }

            const result = await this.participanteRepository.crearVarios(participantesData, t);
            
            if (isLocalTransaction) {
                await t.commit();
            }

            return result;
        } catch (error) {
            if (isLocalTransaction) {
                await t.rollback();
            }
            throw new Error("Error al crear varios participantes: " + error.message);
        }
    }
}