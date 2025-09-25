import areaModel from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import Curso from "../models/curso.models.js";
import logger from '../utils/logger.js';



export const getAreas = async (req, res, next) => {
    try {
        const usuario = req.user.user;

        const areas = await areaModel.findAll({
            include: [
                {
                    model: Ministerio,
                    as: 'detalle_ministerio',
                    attributes: ['cod', 'nombre']
                },
                {
                    model: Curso,
                    as: 'detalle_cursos'
                }
            ]
        });

        if (areas.length === 0) {
            const error = new Error("No existen áreas");
            error.statusCode = 404;
            throw error;
        }

        // logger.info(`getAreas ejecutado por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}`);
        res.status(200).json(areas);
    } catch (error) {
        logger.error(`Error en getAreas por ${req.user?.user.nombre || 'N/A'} ${req.user?.user.apellido || 'N/A'}: ${error.message}`, { meta: error.stack });
        next(error);
    }
};

export const putArea = async (req, res, next) => {
  try {
    const { cod, nombre, ministerio, newCod, esVigente } = req.body;
    const usuario = req.user.user;

    // Buscar el área actual antes de actualizar
    const areaActual = await areaModel.findOne({ where: { cod } });

    if (!areaActual) {
      throw new Error("Área no encontrada.");
    }

    const nombreAnterior = areaActual.nombre;
    const vigenciaAnterior = areaActual.esVigente;

    const area = await areaModel.update(
      { cod: newCod || cod, nombre, ministerio, esVigente },
      { where: { cod } }
    );

    if (area == 0) {
      throw new Error("No hubo cambios para actualizar.");
    }

    logger.info(`Área actualizada por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}: 
      Código: ${cod} → ${newCod || cod}, 
      Nombre: ${nombreAnterior} → ${nombre || nombreAnterior}, 
      Vigente: ${vigenciaAnterior} → ${esVigente ?? vigenciaAnterior}`);

    res.status(200).json({ success: true, message: "Área actualizada correctamente.", area });
  } catch (error) {
    logger.error(`Error en putArea por ${req.user?.user.nombre
         || 'N/A'} ${req.user?.user.apellido || 'N/A'}: ${error.message}`, { meta: error.stack });
    next(error);
  }
};
export const postArea = async (req, res, next) => {
    try {
        const { cod, nombre, ministerio } = req.body;
        const usuario = req.user.user;

        const area = await areaModel.create({ cod, nombre, ministerio, esVigente: true });

        logger.info(`Área creada por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}: Código=${cod}, Nombre=${nombre}, Ministerio=${ministerio}`);
        res.status(201).json(area);
    } catch (error) {
        logger.error(`Error en postArea por ${req.user?.user.nombre || 'N/A'} ${req.user?.user.apellido || 'N/A'}: ${error.message}`, { meta: error.stack });
        next(error);
    }
};

export const deleteArea = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const usuario = req.user.user;

        const deletedCount = await areaModel.destroy({ where: { cod } });

        if (deletedCount === 0) {
            logger.warn(`Intento fallido de eliminación por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}: Área no encontrada (${cod})`);
            return res.status(404).json({ message: "Área no encontrada." });
        }

        logger.warn(`Área eliminada por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}: Código=${cod}`);
        res.status(200).json({ message: "Área eliminada correctamente." });
    } catch (error) {
        logger.error(`Error en deleteArea por ${req.user?.user.nombre || 'N/A'} ${req.user?.user.apellido || 'N/A'}: ${error.message}`, { meta: error.stack });
        next(error);
    }
};
