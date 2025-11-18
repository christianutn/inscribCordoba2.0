import Coordinadores from '../models/coordinadores.models.js';
import AppError from '../../../../utils/appError.js';

export const getCoordinadores = async (req, res, next) => {
    try {
        const coordinadores = await Coordinadores.findAll();
        res.status(200).json({
            status: 'success',
            data: {
                coordinadores
            }
        });
    } catch (error) {
        next(new AppError('Error al obtener los coordinadores', 500));
    }
};

export const getCoordinadorById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coordinador = await Coordinadores.findByPk(id);
        if (!coordinador) {
            return next(new AppError('No se encontró un coordinador con ese ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                coordinador
            }
        });
    } catch (error) {
        next(new AppError('Error al obtener el coordinador', 500));
    }
};

export const createCoordinador = async (req, res, next) => {
    try {
        const { cuil, nota_autorizacion_id } = req.body;
        const newCoordinador = await Coordinadores.create({
            cuil,
            nota_autorizacion_id
        });
        res.status(201).json({
            status: 'success',
            data: {
                coordinador: newCoordinador
            }
        });
    } catch (error) {
        next(new AppError('Error al crear el coordinador', 500));
    }
};

export const updateCoordinador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cuil, nota_autorizacion_id } = req.body;
        const coordinador = await Coordinadores.findByPk(id);
        if (!coordinador) {
            return next(new AppError('No se encontró un coordinador con ese ID', 404));
        }
        await coordinador.update({
            cuil,
            nota_autorizacion_id
        });
        res.status(200).json({
            status: 'success',
            data: {
                coordinador
            }
        });
    } catch (error) {
        next(new AppError('Error al actualizar el coordinador', 500));
    }
};

export const deleteCoordinador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coordinador = await Coordinadores.findByPk(id);
        if (!coordinador) {
            return next(new AppError('No se encontró un coordinador con ese ID', 404));
        }
        await coordinador.destroy();
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(new AppError('Error al eliminar el coordinador', 500));
    }
};
