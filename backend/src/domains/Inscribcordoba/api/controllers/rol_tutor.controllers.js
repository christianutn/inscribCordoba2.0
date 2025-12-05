import RolTutor from "../models/roles_tutor.models.js";


export const getRolesTutor = async (req, res, next) => {
    try {
        const tipoRolTutor = await RolTutor.findAll();
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