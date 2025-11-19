import NotaDeAutorizacionService from "../../core/services/NotaDeAutorizacionService.js"
import AppError from "../../../../utils/appError.js";
import RegistrarNotaAutorizacionUseCase from "../../useCases/RegistrarNotaDeAutorizacion.js";
import GoogleDrive from "../../../../services/GoogleDriveService.js";
import ManejadorArchivos from "../../../../services/ManejadorDeArchivo.js";

import CambiosEstadoNotaDeAutorizacionRepository from "../../core/repositories/CambiosEstadosNotasDeAutorizacionRepository.js";
import CambiosEstadoNotaDeAutorizacionService from "../../core/services/CambiosEstadosNotasDeAutorizacionService.js";
import CambioEstadoNotaDeAutorizacionModel from "../models/cambios_estados_notas_autorizacion.models.js";


export const getNotasDeAutorizacion = async (req, res, next) => {
    try {
        const notaDeAutorizacionService = new NotaDeAutorizacionService();
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
        const notaDeAutorizacionService = new NotaDeAutorizacionService();
        const manejadorArchivos = new ManejadorArchivos("nota_autorizacion");
        const cambiosEstadoNotaDeAutorizacionRepository = new CambiosEstadoNotaDeAutorizacionRepository({
             modeloCambioEstadoNotaDeAutorizacion: CambioEstadoNotaDeAutorizacionModel
        });
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