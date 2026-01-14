import sequelize from '../../../../config/database.js';
import AppError from '../../../../utils/appError.js';

export default class ParticipanteService {

    constructor(participanteRepository) {
        this.participanteRepository = participanteRepository;
    }


    async crearParticipante(participanteData, transaction = null) {

        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            if (!participanteData.nombres || !participanteData.apellido || !participanteData.cuil) {
                throw new AppError("El participante debe tener nombre, apellido y cuil", 400);
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

            throw new AppError("Error al crear el participante: " + error.message, 500);
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
            throw new AppError("Error al buscar participantes por CUILs: " + error.message, 500);
        }
    }

    async crearVarios(participantesData, transaction = null) {
        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            const sonParticipantesValidos = participantesData.every(p => p.nombres && p.apellido && p.cuil);
            if (!sonParticipantesValidos) {
                throw new AppError("Todos los participantes deben tener nombre, apellido y cuil", 400);
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
            throw new AppError("Error al crear varios participantes: " + error.message, 500);
        }
    }

    async actualizarOCrear(participanteData, transaction = null) {
        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            const result = await this.participanteRepository.actualizarOCrear(participanteData, t);

            if (isLocalTransaction) {
                await t.commit();
            }

            return result;
        } catch (error) {
            if (isLocalTransaction) {
                await t.rollback();
            }
            throw new AppError("Error al actualizar o crear el participante: " + error.message, 500);
        }
    }

    async actualizarOCrearVarios(participantesData, transaction = null) {
        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            const sonParticipantesValidos = participantesData.every(p => p.nombres && p.apellido && p.cuil);
            if (!sonParticipantesValidos) {
                throw new AppError("Todos los participantes deben tener nombre, apellido y cuil", 400);
            }

            const result = await this.participanteRepository.actualizarOCrearVarios(participantesData, t);

            if (isLocalTransaction) {
                await t.commit();
            }

            return result;
        } catch (error) {
            if (isLocalTransaction) {
                await t.rollback();
            }
            throw new AppError("Error al actualizar o crear varios participantes: " + error.message, 500);
        }
    }
}