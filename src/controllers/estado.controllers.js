import estadoModel from "../models/estado.models.js";

export const getEstados = async (req, res, next) => {
    try {
        const estados = await estadoModel.findAll();

        if(estados.length === 0){
            
            const error = new Error("No existen estados");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(estados)
    } catch (error) {
        next(error)
    }
}

