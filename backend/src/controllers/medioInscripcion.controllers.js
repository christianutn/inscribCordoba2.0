import medioInscripcionModel from "../models/medioInscripcion.models.js";


export const getMediosInscripcion = async (req, res, next) => {
    try {
        const mediosInscripcion = await medioInscripcionModel.findAll();
        
        if(mediosInscripcion.length === 0){
            
            const error = new Error("No existen medios de inscripción");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(mediosInscripcion)
    } catch (error) {
        next(error)
    }
}


export const putMedioInscripcion = async (req, res, next) => {
    try {
        
        let {cod, nombre, newCod} =  req.body

        if (cod == "" || cod == null || cod == undefined) {

            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (nombre == "" || nombre == null || nombre == undefined) {

            const error = new Error("El nombre no es valido");
            error.statusCode = 400;
            throw error;
        }

        

        nombre = nombre.trim()
        cod = cod.trim()
        newCod = newCod ? newCod.trim() : null
        console.log(req.body)
        const medioInscripcion = await medioInscripcionModel.update({cod: newCod || cod, nombre: nombre}, {
            where: {
                cod: cod
            }
        });

        if(medioInscripcion[0] === 0){
            const error = new Error("No se pudo actualizar el medio de inscripción");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(medioInscripcion);
    } catch (error) {
        
        next(error);
    }
}


