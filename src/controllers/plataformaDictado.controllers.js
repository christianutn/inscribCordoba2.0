import plataformaDictadoModel from "../models/plataformaDictado.models.js";

export const getPlataformasDictado = async (req, res, next) => {
    try {
        const plataformasDictado = await plataformaDictadoModel.findAll();

        if(plataformasDictado.length === 0){
            
            const error = new Error("No existen plataformas de dictado");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(plataformasDictado)
    } catch (error) {
        next(error)
    }
}