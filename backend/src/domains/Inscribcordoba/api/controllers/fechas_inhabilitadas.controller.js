import fechas_inhabilitadas from "../models/fechas_inhabilitadas.models.js";
import AppError from "../../../../utils/appError.js";

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