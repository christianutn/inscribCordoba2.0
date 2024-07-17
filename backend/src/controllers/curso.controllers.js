import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import areaModel from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";
export const getCursos = async (req, res, next) => {
    try {
        const cursos = await cursoModel.findAll({
            include: [
                {
                    model: medioInscripcionModel, as: 'detalle_medioInscripcion'
                },
                {
                    model: tipoCapacitacionModel, as: 'detalle_tipoCapacitacion'
                },
                {
                    model: plataformaDictadoModel, as: 'detalle_plataformaDictado'
                },
                {
                    model: areaModel,
                    as: 'detalle_area',
                    include: [
                        { model: ministerio, as: 'detalle_ministerio' }
                    ]
                }
            ]
        });

        if (cursos.length === 0) {

            const error = new Error("No existen cursos");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(cursos)
    } catch (error) {
        next(error)
    }
}

export const postCurso = async (req, res, next) => {
    try {

        const {cod, nombre, cupo, cantidad_horas, medio_inscripcion,  plataforma_dictado, tipo_capacitacion, area } = req.body;

        console.log("DATOS DEL BODY: ", req.body);

        const existe = await cursoModel.findOne({where: {cod: cod}});
        if(existe) throw new Error("El Código ya existe");
        if(cod.length > 15 ) throw new Error("El Código no es valido debe ser menor a 15 caracteres");
        if(cupo < 1 || isNaN(cupo)) throw new Error("El cupo debe ser mayor a 0");
        if(cantidad_horas < 1 || isNaN(cantidad_horas)) throw new Error("La cantidad de horas debe ser mayor a 0");
        if(medio_inscripcion.length > 15) throw new Error("El medio de inscripción no es valido debe ser menor a 15 caracteres");
        if(plataforma_dictado.length > 15) throw new Error("La plataforma de dictado no es valido debe ser menor a 15 caracteres");
        if(tipo_capacitacion.length > 15) throw new Error("El tipo de capacitación no es valido debe ser menor a 15 caracteres");
        if(area.length > 15) throw new Error("El area no es valido debe ser menor a 15 caracteres");
        if(nombre.length > 100) throw new Error("El nombre no es valido debe ser menor a 100 caracteres");
        if(nombre.length === 0) throw new Error("El nombre no puede ser vacío");
        
        const response = await cursoModel.create(req.body);

        res.status(200).json(response)

    } catch (error) {
        next(error)
    }
}
