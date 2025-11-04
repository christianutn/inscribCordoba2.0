import TipoRolTutor from "../models/tipoRolTutor.models.js";


export const getTipoRolTutor = async (req, res, next) => {
    try {
        const tipoRolTutor = await TipoRolTutor.findAll();
        if (tipoRolTutor.length === 0) {
            const error = new Error("No existen tipoRolTutor");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(tipoRolTutor)
    } catch (error) {
        next(error)
    }
}