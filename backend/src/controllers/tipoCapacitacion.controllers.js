import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";


export const getTiposCapacitacion = async (req, res, next) => {
    try {
        const tiposCapacitacion = await tipoCapacitacionModel.findAll();

        if(tiposCapacitacion.length === 0){
            
            const error = new Error("No existen tipos de capacitacion");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(tiposCapacitacion)
    } catch (error) {
        next(error)
    }
}