import fechas_inhabilitadas_fin from "../models/fechas_inhabilitadas_fin.models.js";
import AppError from "../../../../utils/appError.js";
import { Op } from "sequelize";

export const getFechasInhabilitadasFin = async (req, res, next) => {
    try {
        const fechasInhabilitadasFin = await fechas_inhabilitadas_fin.findAll();
        res.json(fechasInhabilitadasFin);
    } catch (error) {
        next(new AppError('Error al obtener las fechas inhabilitadas fin', 500));
    }
};

export const postFechasInhabilitadasFin = async (req, res, next) => {
    try {
        const { fechas } = req.body;
        const fechasInhabilitadasFin = await fechas_inhabilitadas_fin.bulkCreate(fechas);
        res.status(201).json(fechasInhabilitadasFin);
    } catch (error) {
        next(new AppError('Error al crear la fecha inhabilitada fin', 500));
    }
};

export const deleteFechasInhabilitadasFin = async (req, res, next) => {
    try {
        const { fechas } = req.body;

        // Mapear el array de objetos a un array simple de strings
        // De: [{"fecha": "2025-01-04"}, ...] a: ["2025-01-04", ...]
        const fechasArray = fechas.map(f => f.fecha);

        // Ejecutar el destroy
        const result = await fechas_inhabilitadas_fin.destroy({
            where: {
                fecha: {
                    [Op.in]: fechasArray
                }
            }
        });

        res.status(200).json({
            message: 'Fechas inhabilitadas fin eliminadas correctamente',
            cantidad: result
        });
    } catch (error) {
        next(new AppError('Error al eliminar las fechas inhabilitadas fin', 500));
    }
};
