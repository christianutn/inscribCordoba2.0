// core/repositories/InscripcionRepository.js
import Inscripcion from '../models/inscripcion.model.js';
import sequelize from '../models/index.js';

export default class InscripcionRepository {
    async crear(inscripcionData, transaction = null) {
        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            const inscripcion = await Inscripcion.create(inscripcionData, { transaction: t });
              if (isLocalTransaction) {
                await t.commit();
            }
            return inscripcion;
        } catch (err) {
            if (isLocalTransaction) {
                await t.rollback();
            }
            throw err;
        }
    }

    async actualizar(inscripcionData, options, transaction = null) {
        const t = transaction || await sequelize.transaction();
        const isLocalTransaction = !transaction;

        try {
            // Es crucial que 'update' reciba un objeto de opciones con un 'where'
            const resultado = await Inscripcion.update(inscripcionData, { ...options, transaction: t });

            if (isLocalTransaction) {
                await t.commit();
            }
            return resultado;
        } catch (err) {
            if (isLocalTransaction) {
                await t.rollback();
            }
            throw err;
        }
    }
}
