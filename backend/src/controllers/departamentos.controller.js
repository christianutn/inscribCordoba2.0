import Departamento from "../models/departamentos.models.js";
import logger from '../utils/logger.js';

export const getDepartamentos = async (req, res, next) => {
    try {
        const usuario = req.user.user;

        const departamentos = await Departamento.findAll();

        if (departamentos.length === 0) {
            const error = new Error("No existen los departamentos");
            error.statusCode = 404;
            throw error;
        }

        // logger.info(`getAreas ejecutado por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}`);
        res.status(200).json(departamentos);
    } catch (error) {
        logger.error(`Error en getDepartamentos por ${req.user?.user.nombre || 'N/A'} ${req.user?.user.apellido || 'N/A'}: ${error.message}`, { meta: error.stack });
        next(error);
    }
};
