import logger from "../../../../utils/logger.js";
import AppError from "../../../../utils/appError.js";
import RegistrarNotaAutorizacionUseCase from "../../useCases/RegistrarNotaDeAutorizacion.js";
import GoogleDrive from "../../../../services/GoogleDriveService.js";
import ManejadorArchivos from "../../../../services/ManejadorDeArchivo.js";
import NotaDeAutorizacionService from "../../core/services/NotaDeAutorizacionService.js"
import NotaDeAutorizacionRepository from "../../core/repositories/NotaDeAutorizacionRepository.js";
import RegistrarAutoricionDeNotaDeAutorizacion from "../../useCases/RegistrarAutorizacionNotaDeAutorizacion.js";

import CambiosEstadoNotaDeAutorizacionRepository from "../../core/repositories/CambiosEstadosNotasDeAutorizacionRepository.js";
import CambiosEstadoNotaDeAutorizacionService from "../../core/services/CambiosEstadosNotasDeAutorizacionService.js";
import EmailAdapter from "../../../../adapters/EmailAdapter.js";
import Personas from "../models/persona.models.js";
import Area from "../models/area.models.js";


import HistoricoTutoresEnCursoService from "../../core/services/HistoricoTutoresEnCursoService.js";
import HistoricoTutoresEnCursoRepository from "../../core/repositories/HistoricoTutoresEnCursoRepository.js";

import CoordinadorService from "../../core/services/CoordinadorService.js";
import CoordinadorRepository from "../../core/repositories/CoordinadorRespository.js";

import enviarCorreo from "../../../../utils/enviarCorreo.js";
import { generarHtmlAutorizacion } from "../../../../utils/mensajesHtml.js";

export const getNotasDeAutorizacion = async (req, res, next) => {
    try {
        logger.info('📋 Iniciando consulta de notas de autorización');

        const notaDeAutorizacionService = new NotaDeAutorizacionService({ notaDeAutorizacionRepository: new NotaDeAutorizacionRepository() });
        const notasDeAutorizacion = await notaDeAutorizacionService.getNotasDeAutorizacion();

        logger.info(`✅ Notas de autorización obtenidas: ${notasDeAutorizacion.length} registros`);
        res.status(200).json(notasDeAutorizacion);

    } catch (error) {
        logger.error(`❌ Error al buscar notas de autorización: ${error.message}`, { stack: error.stack });
        next(new AppError("Error al buscar notas de autorizacion", 500));
    }
}

export const registrarNotaDeAutorizacion = async (req, res, next) => {
    try {
        logger.info('📄 Iniciando registro de nota de autorización');

        if (!req.file) {
            logger.warn('⚠️ Intento de registro sin archivo adjunto');
            return next(new AppError("No se ha subido ningún archivo.", 400));
        }

        const usuario = req.user.user;
        logger.info(`👤 Usuario ${usuario.cuil} (${usuario.apellido}) - Área: ${usuario.area}`);
        logger.info(`📎 Archivo: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

        // Instanciamos las dependencias que necesita el caso de uso
        const googleDriveService = new GoogleDrive();
        const notaDeAutorizacionService = new NotaDeAutorizacionService({ notaDeAutorizacionRepository: new NotaDeAutorizacionRepository() });
        const manejadorArchivos = new ManejadorArchivos("nota_autorizacion");
        const cambiosEstadoNotaDeAutorizacionRepository = new CambiosEstadoNotaDeAutorizacionRepository();
        const cambiosEstadoNotaDeAutorizacionService = new CambiosEstadoNotaDeAutorizacionService({
            repositorioCambioEstadoNotaDeAutorizacion: cambiosEstadoNotaDeAutorizacionRepository
        });

        // Instanciamos el adapter de email
        const emailAdapter = new EmailAdapter();


        // Creamos la instancia del caso de uso, inyectando las dependencias
        const registrarNota = new RegistrarNotaAutorizacionUseCase(
            req.file, // Pasamos el objeto de archivo completo
            usuario.cuil,
            usuario.apellido,
            usuario.area,
            {
                googleDriveService,
                notaDeAutorizacionService,
                manejadorArchivos,
                cambiosEstadoNotaDeAutorizacionService,
                emailAdapter,
                personaModel: Personas,
                areaModel: Area

            }
        );

        const resultado = await registrarNota.ejecutar();

        logger.info(`✅ Nota de autorización registrada exitosamente - Ruta: ${resultado.ruta}`);
        res.status(201).json(resultado);

    } catch (error) {
        logger.error(`❌ Error al registrar nota de autorización: ${error.message}`, {
            stack: error.stack,
            file: req.file?.originalname,
            user: req.user?.user?.cuil
        });
        next(error); // Dejamos que el error original fluya al manejador de errores global
    }
}

export const autorizarNotaDeAutorizacion = async (req, res, next) => {
    try {
        logger.info('✍️ Iniciando autorización de nota de autorización');

        // Inyectamos dependencias
        const tutores = req.body.tutores;
        const coordinadores = req.body.coordinadores;
        const autorizador = req.body.autorizador;
        const cursos = req.body.cursos;
        const nota_autorizacion = req.body.nota_autorizacion;
        const usuario_cuil = req.user.user.cuil;

        logger.info(`📝 Nota ID: ${nota_autorizacion} - Autorizador: ${autorizador} - Usuario: ${usuario_cuil}`);
        logger.info(`👥 Tutores: ${tutores?.length || 0}, Coordinadores: ${coordinadores?.length || 0}, Cursos: ${cursos?.length || 0}`);

        const cambioEstadoNotaDeAutorizacionRepository = new CambiosEstadoNotaDeAutorizacionRepository();
        const cambioEstadoNotaDeAutorizacionService = new CambiosEstadoNotaDeAutorizacionService({
            repositorioCambioEstadoNotaDeAutorizacion: cambioEstadoNotaDeAutorizacionRepository
        });

        const notaDeAutorizacionRepository = new NotaDeAutorizacionRepository();
        const notaDeAutorizacionService = new NotaDeAutorizacionService({ notaDeAutorizacionRepository });

        const historicoTutoresEnCursoRepository = new HistoricoTutoresEnCursoRepository();
        const historicoTutoresEnCursoService = new HistoricoTutoresEnCursoService({ repositorioHistoricoTutoresEnCursoRepository: historicoTutoresEnCursoRepository });

        const coordinadorRepository = new CoordinadorRepository();
        const coordinadorService = new CoordinadorService({ CoordinadorRepository: coordinadorRepository });


        const registrarAutorizacionNotaDeAutorizacion = new RegistrarAutoricionDeNotaDeAutorizacion(
            {
                CambiosEstadoNotaDeAutorizacionService: cambioEstadoNotaDeAutorizacionService,
                NotaDeAutorizacionService: notaDeAutorizacionService,
                HistoricoTutoresEnCursoService: historicoTutoresEnCursoService,
                CoordinadorService: coordinadorService,
                generarHtmlAutorizacion,
                enviarCorreo
            },
            {
                tutores,
                coordinadores,
                autorizador,
                cursos,
                nota_autorizacion,
                usuario_cuil
            }
        );

        const resultado = await registrarAutorizacionNotaDeAutorizacion.ejecutar();

        logger.info(`✅ Nota de autorización autorizada exitosamente - ID: ${nota_autorizacion}`);
        res.status(201).json(resultado);

    } catch (error) {
        logger.error(`❌ Error al autorizar nota de autorización: ${error.message}`, {
            stack: error.stack,
            notaId: req.body.nota_autorizacion,
            user: req.user?.user?.cuil
        });
        next(error);
    }
}