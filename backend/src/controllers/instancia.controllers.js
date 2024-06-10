import instanciaModel from "../models/instancia.models.js";
import Curso from "../models/curso.models.js";
import Estado from "../models/estado.models.js";


export const getInstancias = async (req, res, next) => {
    try {
        const instancias = await instanciaModel.findAll({
            include: [
                {
                    model: Curso, as: 'detalle_curso'
                },
                {
                    model: Estado, as: 'detalle_estado'
                }
            ]
        });

        if(instancias.length === 0){
            
            const error = new Error("No existen instancias");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(instancias)
    } catch (error) {
        next(error)
    }
}

