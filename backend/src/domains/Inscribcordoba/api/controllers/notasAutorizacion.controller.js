import AppError from "../../../../utils/appError.js";
import RegistrarNotaAutorizacionUseCase from "../../useCases/RegistrarNotaDeAutorizacion.js";
import GoogleDrive from "../../../../services/GoogleDriveService.js";
import ManejadorArchivos from "../../../../services/ManejadorDeArchivo.js";
import NotaDeAutorizacionService from "../../core/services/NotaDeAutorizacionService.js"
import NotaDeAutorizacionRepository from "../../core/repositories/NotaDeAutorizacionRepository.js";
import RegistrarAutoricionDeNotaDeAutorizacion from "../../useCases/RegistrarAutorizacionNotaDeAutorizacion.js";

import CambiosEstadoNotaDeAutorizacionRepository from "../../core/repositories/CambiosEstadosNotasDeAutorizacionRepository.js";
import CambiosEstadoNotaDeAutorizacionService from "../../core/services/CambiosEstadosNotasDeAutorizacionService.js";

import HistoricoTutoresEnCursoService from "../../core/services/HistoricoTutoresEnCursoService.js";
import HistoricoTutoresEnCursoRepository from "../../core/repositories/HistoricoTutoresEnCursoRepository.js";

import CoordinadorService from "../../core/services/CoordinadorService.js";
import CoordinadorRepository from "../../core/repositories/CoordinadorRespository.js";

import enviarCorreo from "../../../../utils/enviarCorreo.js";
import { generarHtmlAutorizacion } from "../../../../utils/mensajesHtml.js";

export const getNotasDeAutorizacion = async (req, res, next) => {
    try {
        const notaDeAutorizacionService = new NotaDeAutorizacionService({ notaDeAutorizacionRepository: new NotaDeAutorizacionRepository() });
        const notasDeAutorizacion = await notaDeAutorizacionService.getNotasDeAutorizacion();
        res.status(200).json(notasDeAutorizacion);

    } catch (error) {
        next(new AppError("Error al buscar notas de autorizacion", 500));
    }
}

export const registrarNotaDeAutorizacion = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError("No se ha subido ningún archivo.", 400));
        }

        const usuario = req.user.user;

        // Instanciamos las dependencias que necesita el caso de uso
        const googleDriveService = new GoogleDrive();
        const notaDeAutorizacionService = new NotaDeAutorizacionService({ notaDeAutorizacionRepository: new NotaDeAutorizacionRepository() });
        const manejadorArchivos = new ManejadorArchivos("nota_autorizacion");
        const cambiosEstadoNotaDeAutorizacionRepository = new CambiosEstadoNotaDeAutorizacionRepository();
        const cambiosEstadoNotaDeAutorizacionService = new CambiosEstadoNotaDeAutorizacionService({
            repositorioCambioEstadoNotaDeAutorizacion: cambiosEstadoNotaDeAutorizacionRepository
        });


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
                cambiosEstadoNotaDeAutorizacionService

            }
        );

        const resultado = await registrarNota.ejecutar();
        res.status(201).json(resultado);

    } catch (error) {
        next(error); // Dejamos que el error original fluya al manejador de errores global
    }
}

export const autorizarNotaDeAutorizacion = async (req, res, next) => {
    try {
        // Inyectamos dependencias
        const tutores = req.body.tutores;
        const coordinadores = req.body.coordinadores;
        const autorizador = req.body.autorizador;
        const cursos = req.body.cursos;
        const nota_autorizacion = req.body.nota_autorizacion;
        const usuario_cuil = req.user.user.cuil;

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

        res.status(201).json(resultado);

    } catch (error) {
        next(error);
    }
}