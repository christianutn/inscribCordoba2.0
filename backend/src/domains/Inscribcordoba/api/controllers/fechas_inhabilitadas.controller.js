import fechas_inhabilitadas from "../models/fechas_inhabilitadas.models.js";
import AppError from "../../../../utils/appError.js";
import { Op } from "sequelize";

export const getFechasInhabilitadas = async (req, res, next) => {
    try {
        const fechasInhabilitadas = await fechas_inhabilitadas.findAll();
        res.json(fechasInhabilitadas);
    } catch (error) {
        next(new AppError('Error al obtener las fechas inhabilitadas', 500));
    }
};

export const postFechasInhabilitadas = async (req, res, next) => {
    try {
        const { fechas } = req.body;
        const fechasInhabilitadas = await fechas_inhabilitadas.bulkCreate(fechas);
        res.status(201).json(fechasInhabilitadas);
    } catch (error) {
        next(new AppError('Error al crear la fecha inhabilitada', 500));
    }
};

export const deleteFechasInhabilitadas = async (req, res, next) => {
    try {
        const { fechas } = req.body;

        // 1. Mapear el array de objetos a un array simple de strings
        // De: [{"fecha": "2025-01-04"}, ...] a: ["2025-01-04", ...]
        const fechasArray = fechas.map(f => f.fecha);

        // 2. Ejecutar el destroy
        const result = await fechas_inhabilitadas.destroy({
            where: {
                fecha: {
                    [Op.in]: fechasArray // Pasamos el array limpio
                }
            }
        });

        // result devolverá la cantidad de filas eliminadas
        res.status(200).json({
            message: 'Fechas eliminadas correctamente',
            cantidad: result
        });
    } catch (error) {
        // Corregido el mensaje de error para que sea coherente con la acción
        next(new AppError('Error al eliminar las fechas inhabilitadas', 500));
    }
};