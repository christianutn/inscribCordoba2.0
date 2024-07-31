import instanciaModel from "../models/instancia.models.js";
import Curso from "../models/curso.models.js";
import Estado from "../models/estado.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import validarFormatoFecha from "../utils/validarFormatoFecha.js";


export const getInstancias = async (req, res, next) => {
    try {
        const instancias = await instanciaModel.findAll({
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

export const postInstancia = async (req, res, next) => {
    try {
        const { curso, fecha_inicio_inscripcion, fecha_fin_inscripcion, fecha_inicio_curso, fecha_fin_curso, estado, es_publicada_portal_cc } = req.body;

       if(!validarFormatoFecha(fecha_inicio_inscripcion) || !validarFormatoFecha(fecha_fin_inscripcion) || !validarFormatoFecha(fecha_inicio_curso) || !validarFormatoFecha(fecha_fin_curso)){
            const error = new Error("Formato de fecha inválido");
            error.statusCode = 400;
            throw error;
        }

        const instancia = await instanciaModel.create({
            curso,
            fecha_inicio_inscripcion,
            fecha_fin_inscripcion,
            fecha_inicio_curso,
            fecha_fin_curso,
            estado,
            es_publicada_portal_cc
        });
        res.status(201).json(instancia);
    } catch (error) {
        next(error);
    }
}

