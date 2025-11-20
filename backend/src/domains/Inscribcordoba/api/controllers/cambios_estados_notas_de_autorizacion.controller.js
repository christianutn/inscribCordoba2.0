
import CambiosEstadoNotaDeAutorizacionRepository from "../../core/repositories/CambiosEstadosNotasDeAutorizacionRepository.js";
import CambiosEstadoNotaDeAutorizacionService from "../../core/services/CambiosEstadosNotasDeAutorizacionService.js";
import CambioEstadoNotaDeAutorizacionModel from "../models/cambios_estados_notas_autorizacion.models.js";
import ObtenerTodosUltimoEstadoDeNotasDeAutorizacion from "../../useCases/ObtenerTodosUltimoEstadoDeNotasDeAutorizacion.js";
import AppError from "../../../../utils/appError.js";


export const getTodosLosUltimosEstadoDeNotaDeAutorizacion = async (req, res, next) => {

    try {
        const cambioEstadoNotaDeAutorizacion = new CambiosEstadoNotaDeAutorizacionRepository({
            modeloCambioEstadoNotaDeAutorizacion: CambioEstadoNotaDeAutorizacionModel
        });

        const cambioEstadoNotaDeAutorizacionService = new CambiosEstadoNotaDeAutorizacionService({
            repositorioCambioEstadoNotaDeAutorizacion: cambioEstadoNotaDeAutorizacion
        });

        const obtenerTodosUltimoEstadoDeNotasDeAutorizacion = new ObtenerTodosUltimoEstadoDeNotasDeAutorizacion({ repositorioCambioEstadoNotaDeAutorizacion: cambioEstadoNotaDeAutorizacionService })

        const ultimosCambiosEstados = await obtenerTodosUltimoEstadoDeNotasDeAutorizacion.ejecutar();

        res.status(200).json(ultimosCambiosEstados);

    } catch (error) {
        next(new AppError("Error al buscar notas de autorizacion", 500));
    }

}