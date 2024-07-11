import autorizadorModel from "../models/autorizador.models.js";
import Persona from "../models/persona.models.js";
import Curso from "../models/curso.models.js";


export const getAutorizadores = async (req, res, next) => {
    try {
        const autorizadores = await autorizadorModel.findAll({
            include: [
                {
                    model: Persona, as: 'detalle_persona'
                },
                {
                    model: Curso, as: 'detalle_curso'
                }
            ]
        });

        if(autorizadores.length === 0){
            
            const error = new Error("No existen autorizadores");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(autorizadores)
    } catch (error) {
        next(error)
    }
}