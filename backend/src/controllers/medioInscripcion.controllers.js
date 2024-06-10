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