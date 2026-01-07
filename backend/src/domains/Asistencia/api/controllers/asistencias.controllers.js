
import AsistenciaRepository from '../../core/repositories/AsistenciaRepository.js';
import AsistenciaService from '../../core/services/AsistenciaService.js';
import InscripcionRepository from '../../core/repositories/InscipcionRepository.js';
import InscripcionService from '../../core/services/InscripcionService.js';
import AsistenciaModel from '../models/asistencia.model.js';
import AppError from '../../../../utils/appError.js';

const asistenciaService = new AsistenciaService(new AsistenciaRepository());
const inscripcionService = new InscripcionService(new InscripcionRepository());

export const obtenerAsistenciaPorEvento = async (req, res, next) => {
    try {
        const { id_evento, cuil } = req.query;
        if (!id_evento || !cuil) {
            return next(new AppError('id_evento y cuil son requeridos.', 400));
        }
        const resultado = await asistenciaService.obtenerHistorialAsistencia(id_evento, cuil);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};


export const consultarAsistencia = async (req, res, next) => {
    try {
        const { cuil, id_evento } = req.params;

        const resultado = await inscripcionService.consultarEstadoInscripcion(cuil, id_evento);

        res.status(200).json(resultado);

    } catch (error) {
        next(error);
    }
};

export const registrarAsistencia = async (req, res, next) => {
    try {
        const { cuil, id_evento } = req.body; // Recibimos del body

        if (!cuil || !id_evento) {
            return next(new AppError('CUIL e ID de evento son requeridos.', 400));
        }

        const resultado = await asistenciaService.registrarAsistencia(cuil, id_evento);

        res.status(200).json(resultado);

    } catch (error) {
        next(error);
    }
};

export const obtenerListaParticipantes = async (req, res, next) => {
    try {
        const { id_evento } = req.query;

        if (!id_evento) {
            return next(new AppError('ID de evento es requerido.', 400));
        }

        const resultado = await inscripcionService.listarParticipantesConNotas(id_evento);

        res.status(200).json(resultado);

    } catch (error) {
        next(error);
    }
};

export const registrarAsistenciaManual = async (req, res, next) => {
    try {
        const { cuil, id_evento, fecha, estado_asistencia } = req.body; // Recibimos del body

        if (!cuil || !id_evento || !fecha) {
            return next(new AppError('CUIL, ID de evento y fecha son requeridos.', 400));
        }

        if (estado_asistencia != '1' && estado_asistencia != '0') {
            return next(new AppError('Estado de asistencia debe ser 1 o 0.', 400));
        }

        // devolver error si la asitencia no existe

        const asistencia = await AsistenciaModel.findOne({ where: { cuil, id_evento, fecha } });
        if (!asistencia) {
            return next(new AppError('Asistencia no encontrada.', 404));
        }

        // actualizar la asistencia
        asistencia.fecha = fecha;
        asistencia.estado_asistencia = estado_asistencia;
        await asistencia.save();

        res.status(200).json(asistencia);

    } catch (error) {
        next(error);
    }
};


