import sequelize from "../../../../config/database.js";

// ... existing imports ...
import CambiosEstadoNotaDeAutorizacionRepository from "../../core/repositories/CambiosEstadosNotasDeAutorizacionRepository.js";
import CambiosEstadoNotaDeAutorizacionService from "../../core/services/CambiosEstadosNotasDeAutorizacionService.js";
import CambioEstadoNotaDeAutorizacionModel from "../models/cambios_estados_notas_autorizacion.models.js";
import ObtenerTodosUltimoEstadoDeNotasDeAutorizacion from "../../useCases/ObtenerTodosUltimoEstadoDeNotasDeAutorizacion.js";
import AppError from "../../../../utils/appError.js";
import RechazarNotaDeAutorizacion from "../../useCases/RechazarNotaDeAutorizacion.js";


export const getTodosLosUltimosEstadoDeNotaDeAutorizacion = async (req, res, next) => {

    try {
        const cambioEstadoNotaDeAutorizacion = new CambiosEstadoNotaDeAutorizacionRepository({
            modeloCambioEstadoNotaDeAutorizacion: CambioEstadoNotaDeAutorizacionModel
        });

        const cambioEstadoNotaDeAutorizacionService = new CambiosEstadoNotaDeAutorizacionService({
            repositorioCambioEstadoNotaDeAutorizacion: cambioEstadoNotaDeAutorizacion
        });

        const obtenerTodosUltimoEstadoDeNotasDeAutorizacion = new ObtenerTodosUltimoEstadoDeNotasDeAutorizacion({ repositorioCambioEstadoNotaDeAutorizacion: cambioEstadoNotaDeAutorizacionService })


        // Si el rol es de referente entonces se deben filtrar los resultados

        let areaDeReferente = null;
        if (req.user.user.rol == "REF") {
            areaDeReferente = req.user.user.area
        }
        const ultimosCambiosEstados = await obtenerTodosUltimoEstadoDeNotasDeAutorizacion.ejecutar(areaDeReferente);

        res.status(200).json(ultimosCambiosEstados);

    } catch (error) {
        next(new AppError("Error al buscar notas de autorizacion", 500));
    }

}

export const rechazarNotaDeAutorizacion = async (req, res, next) => {
    const t = await sequelize.transaction();
    const options = { transaction: t };
    try {
        const cambioEstadoNotaDeAutorizacion = new CambiosEstadoNotaDeAutorizacionRepository({
            modeloCambioEstadoNotaDeAutorizacion: CambioEstadoNotaDeAutorizacionModel
        });

        const cambioEstadoNotaDeAutorizacionService = new CambiosEstadoNotaDeAutorizacionService({
            repositorioCambioEstadoNotaDeAutorizacion: cambioEstadoNotaDeAutorizacion
        });

        const useCase = new RechazarNotaDeAutorizacion({ repositorioCambioEstadoNotaDeAutorizacion: cambioEstadoNotaDeAutorizacionService })

        const resultado = await useCase.ejecutar(req.body, options);

        await t.commit();

        res.status(201).json(resultado);

    } catch (error) {
        await t.rollback();
        next(new AppError("Error al rechazar nota de autorizacion", 500));
    }

}