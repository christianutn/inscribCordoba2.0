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

    async findOrCreate(options) {
        return await Participante.findOrCreate(options);
    }

    async actualizarOCrear(participanteData, transaction = null) {
        try {
            const result = await Participante.upsert(
                participanteData,
                {
                    fields: Object.keys(participanteData), // Optional: explicitly limit fields
                    transaction
                }
            );
            // Sequelize upsert on MySQL returns [record, created] or just created depending on version/config? 
            // Actually usually just boolean or 1.
            // Safe bet: find the record after upsert if we need the instance. 
            // OR simply return `result` which might be enough if we don't use the return value in service (Service doesn't assign it).
            return result;
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

    async actualizarOCrearVarios(participantesData, transaction = null) {
        try {
            // bulkCreate con updateOnDuplicate hace upsert masivo
            // Si el registro existe (por clave primaria 'cuil'), actualiza los campos listados
            // Si no existe, lo crea
            const participantes = await Participante.bulkCreate(
                participantesData,
                {
                    updateOnDuplicate: ['nombres', 'apellido', 'correo_electronico', 'es_empleado', 'reparticion'],
                    transaction
                }
            );
            return participantes;
        } catch (error) {
            throw error;
        }
    }

}