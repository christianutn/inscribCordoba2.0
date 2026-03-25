import Efemeride from '../models/efemeride.models.js';
import Curso from '../models/curso.models.js';
import AppError from "../../../../utils/appError.js";
import sequelize from '../../../../config/database.js';
import { DateTime } from "luxon";
import logger from '../../../../utils/logger.js';
import EmailAdapter from '../../../../adapters/EmailAdapter.js';
import config from '../../../../config/env.config.js';

const emailAdapter = new EmailAdapter();


/**
 * Obtiene todas las efemérides, ordenadas por fecha ascendente.
 */
export const getEfemerides = async (req, res, next) => {
    try {
        const { rol, cuil } = req.user.user;
        const whereClause = {};

        // Filtro: Si NO es ADM ni GA, solo ve sus propias efemérides
        if (rol !== 'ADM' && rol !== 'GA') {
            whereClause.usuario = cuil;
            logger.info(`🔐 Filtrando efemérides para usuario: ${cuil} (Rol: ${rol})`);
        }

        const efemerides = await Efemeride.findAll({
            where: whereClause,
            order: [['fecha', 'ASC']],
            include: [
                {
                    model: Curso,
                    as: 'detalle_curso',
                    attributes: ['cod', 'nombre']
                }
            ]
        });

        logger.info(`✅ Efemérides obtenidas - Total: ${efemerides.length} registros`);
        res.status(200).json(efemerides);
    } catch (error) {
        logger.error(`❌ Error al obtener efemérides: ${error.message}`, {
            stack: error.stack
        });
        next(error);
    }
};


/**
 * Obtiene las efemérides filtradas por curso.
 */
export const getEfemeridesByCurso = async (req, res, next) => {
    try {
        const { curso } = req.params;

        logger.info(`🔍 Buscando efemérides por curso - Curso: ${curso}`);

        const { rol, cuil } = req.user.user;
        const whereClause = { curso };

        // Filtro: Si NO es ADM ni GA, solo ve sus propias efemérides en ese curso
        if (rol !== 'ADM' && rol !== 'GA') {
            whereClause.usuario = cuil;
            logger.info(`🔐 Filtrando efemérides del curso ${curso} para usuario: ${cuil} (Rol: ${rol})`);
        }

        const efemerides = await Efemeride.findAll({
            where: whereClause,
            order: [['fecha', 'ASC']],
            include: [
                {
                    model: Curso,
                    as: 'detalle_curso',
                    attributes: ['cod', 'nombre']
                }
            ]
        });

        logger.info(`✅ Efemérides encontradas para curso ${curso}: ${efemerides.length} registros`);
        res.status(200).json(efemerides);
    } catch (error) {
        logger.error(`❌ Error al buscar efemérides por curso: ${error.message}`, {
            stack: error.stack
        });
        next(error);
    }
};


/**
 * Crea una o múltiples efemérides para un curso en una transacción.
 * Espera recibir:
 *   {
 *     curso: string,
 *     efemerides: [{ fecha: string, descripcion: string }]
 *   }
 * 
 * El campo 'usuario' se calcula desde req.user.user.cuil
 * El campo 'created_at' se calcula en hora argentina (UTC-3) mediante Luxon
 */
export const postEfemerides = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        logger.info('📅 Iniciando creación de efemérides');

        const { curso, efemerides } = req.body;
        const usuarioCuil = req.user.user.cuil;

        // Validar que se recibieron datos
        if (!curso || !efemerides || !Array.isArray(efemerides) || efemerides.length === 0) {
            throw new AppError("Debe proporcionar un curso y al menos una efeméride", 400);
        }

        logger.info(`📚 Curso: ${curso} - Usuario: ${usuarioCuil} - Efemérides a crear: ${efemerides.length}`);

        // Verificar que el curso existe
        const cursoExistente = await Curso.findOne({
            where: { cod: curso },
            transaction: t
        });

        if (!cursoExistente) {
            logger.warn(`⚠️ Intento de crear efemérides con curso inexistente - Curso: ${curso}`);
            throw new AppError("El curso especificado no existe", 400);
        }

        // Validar cada efeméride
        for (const ef of efemerides) {
            if (!ef.fecha || !ef.descripcion) {
                throw new AppError("Cada efeméride debe tener fecha y descripción", 400);
            }
        }

        // Calcular created_at en hora argentina
        const createdAt = DateTime.now()
            .setZone('America/Argentina/Buenos_Aires')
            .toFormat("yyyy-MM-dd HH:mm:ss");

        // Crear las efemérides en bulk dentro de la transacción
        const registros = efemerides.map(ef => ({
            usuario: usuarioCuil,
            curso,
            fecha: ef.fecha,
            descripcion: ef.descripcion.trim(),
            observacion: ef.observacion?.trim() || null,
            url_disenio: ef.url_disenio?.trim() || null,
            created_at: createdAt
        }));

        const efemeridesCreadas = await Efemeride.bulkCreate(registros, { transaction: t });

        // Commit de la transacción
        await t.commit();

        logger.info(`✅ Efemérides creadas exitosamente - Curso: ${curso} - Cantidad: ${efemeridesCreadas.length}`);

        // Enviar notificación por correo de forma asíncrona
        emailAdapter.enviarNotificacionEfemerideCargada(req.user.user, cursoExistente, efemerides)
            .catch(err => logger.error(`❌ Error al enviar notificación de efemérides: ${err.message}`));

        res.status(201).json({
            message: `Se crearon ${efemeridesCreadas.length} efeméride(s) correctamente`,
            efemerides: efemeridesCreadas
        });
    } catch (error) {
        if (t && !t.finished) {
            try {
                await t.rollback();
                logger.info(`🔄 Rollback ejecutado exitosamente`);
            } catch (rollbackError) {
                logger.error(`❌ Error en rollback al crear efemérides: ${rollbackError.message}`, {
                    stack: rollbackError.stack
                });
            }
        }

        logger.error(`❌ Error al crear efemérides - Curso: ${req.body.curso} - Usuario: ${req.user?.user?.cuil || 'N/A'} - Error: ${error.message}`, {
            stack: error.stack,
            curso: req.body.curso,
            usuario: req.user?.user?.cuil
        });
        next(error);
    }
};


/**
 * Elimina una efeméride por su ID.
 */
export const deleteEfemeride = async (req, res, next) => {
    try {
        const { id } = req.params;

        logger.info(`🗑️ Iniciando eliminación de efeméride - ID: ${id}`);

        if (!id) {
            throw new AppError("ID de la efeméride no proporcionado", 400);
        }

        const efemeride = await Efemeride.findByPk(id);

        if (!efemeride) {
            logger.warn(`⚠️ Intento de eliminar efeméride inexistente - ID: ${id}`);
            throw new AppError("Efeméride no encontrada", 404);
        }

        await efemeride.destroy();

        logger.info(`✅ Efeméride eliminada exitosamente - ID: ${id}`);

        res.status(200).json({ message: "Efeméride eliminada correctamente" });
    } catch (error) {
        logger.error(`❌ Error al eliminar efeméride - ID: ${req.params.id} - Error: ${error.message}`, {
            stack: error.stack
        });
        next(error);
    }
};


/**
 * Actualiza una efeméride existente por su ID.
 */
export const putEfemeride = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fecha, descripcion, observacion, url_disenio } = req.body;

        logger.info(`✏️ Iniciando actualización de efeméride - ID: ${id}`);

        const efemeride = await Efemeride.findByPk(id);

        if (!efemeride) {
            logger.warn(`⚠️ Intento de actualizar efeméride inexistente - ID: ${id}`);
            throw new AppError("Efeméride no encontrada", 404);
        }

        await efemeride.update({
            ...(fecha && { fecha }),
            ...(descripcion && { descripcion: descripcion.trim() }),
            ...(observacion !== undefined && { observacion: observacion?.trim() || null }),
            ...(url_disenio !== undefined && { url_disenio: url_disenio?.trim() || null }),
        });

        logger.info(`✅ Efeméride actualizada exitosamente - ID: ${id}`);

        res.status(200).json({
            message: "Efeméride actualizada correctamente",
            efemeride
        });
    } catch (error) {
        logger.error(`❌ Error al actualizar efeméride - ID: ${req.params.id} - Error: ${error.message}`, {
            stack: error.stack
        });
        next(error);
    }
};
