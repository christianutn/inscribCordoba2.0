import personaModel from "../models/personas.models.js";

export const getPersonas = async (req, res, next) => {
    try {
        const personas = await personaModel.findAll();

        if(personas.length === 0){
            
            const error = new Error("No existen personas");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(personas)
    } catch (error) {
        next(error)
    }
}