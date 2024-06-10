import ministerioModel from "../models/ministerio.models.js";

export const getMinisterios = async (req, res, next) => {
    try {
        const ministerios = await ministerioModel.findAll();

        if(ministerios.length === 0){

            const error = new Error("No existen ministerios");
            error.statusCode = 404;
            throw error;
        } 

        res.status(200).json(ministerios)
    } catch (error) {
        next(error)
    }
}