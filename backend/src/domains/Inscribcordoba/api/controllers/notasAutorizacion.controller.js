import NotaDeAutorizacionService from "../../core/services/NotaDeAutorizacionService.js"
import AppError from "../../../../utils/appError.js";

export const getNotasDeAutorizacion = async (req, res, next) => {
    try {
        const notaDeAutorizacionService = new NotaDeAutorizacionService();
        const notasDeAutorizacion = await notaDeAutorizacionService.getNotasDeAutorizacion();
        res.status(200).json(notasDeAutorizacion);

    } catch (error) {
        next(new AppError("Error al buscar notas de autorizacion", 500));
    }
}