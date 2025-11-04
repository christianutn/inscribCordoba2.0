import rolModel from "../models/rol.models.js";

export const getRoles = async (req, res, next) => {
    try {
        const roles = await rolModel.findAll();

        if(roles.length === 0){
            
            const error = new Error("No existen roles");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(roles)
    } catch (error) {
        next(error)
    }
}