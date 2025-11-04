import tutorXInstanciaModel from "../models/tutorXInstancia.models.js";
import Instancia from "../models/instancia.models.js";
import Persona from "../models/persona.models.js";
import Curso from "../models/curso.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";

export const getTutoresXInstancia = async (req, res, next) => {
    try {
        const tutoresXInstancia = await tutorXInstanciaModel.findAll({
            include: [
                {
                    model: Persona, as: 'detalle_tutor' 
                },
                {
                    model: Instancia, as: 'detalle_instancia', 

                    include: [
                        {
                            model: Curso, as: 'detalle_curso',
                            include: [
                                {
                                    model: Area, as: 'detalle_area',
                                    include: [
                                        {
                                            model: Ministerio, as: 'detalle_ministerio'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (tutoresXInstancia.length === 0) {
            const error = new Error("No existen tutoresXInstancia");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(tutoresXInstancia);
    } catch (error) {
        next(error);
    }
};
