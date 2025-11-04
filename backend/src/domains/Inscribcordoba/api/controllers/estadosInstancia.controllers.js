import EstadosInstancia from "../models/estado_instancia.models.js"
import AppError from "../../../../utils/appError.js"

export const getEstadosInstancias = async (req, res, next) => {
    try {
        const eventos = await EstadosInstancia.findAll();
        res.status(200).json(eventos);
    } catch (error) {
        next(new AppError("Error al buscar Estados de instancia", 500));
    }
}
