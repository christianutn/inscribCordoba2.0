import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import areaModel from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";

import {actualizarDatosColumna} from "../googleSheets/services/actualizarDatosColumna.js";
import sequelize from "../config/database.js";
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

        const { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area } = req.body;

    
        const existe = await cursoModel.findOne({ where: { cod: cod } });
        if (existe) throw new Error("El Código ya existe");
        if (cod.length > 15) throw new Error("El Código no es valido debe ser menor a 15 caracteres");
        if (cupo < 1 || isNaN(cupo)) throw new Error("El cupo debe ser mayor a 0");
        if (cantidad_horas < 1 || isNaN(cantidad_horas)) throw new Error("La cantidad de horas debe ser mayor a 0");
        if (medio_inscripcion.length > 15) throw new Error("El medio de inscripción no es valido debe ser menor a 15 caracteres");
        if (plataforma_dictado.length > 15) throw new Error("La plataforma de dictado no es valido debe ser menor a 15 caracteres");
        if (tipo_capacitacion.length > 15) throw new Error("El tipo de capacitación no es valido debe ser menor a 15 caracteres");
        if (area.length > 15) throw new Error("El area no es valido debe ser menor a 15 caracteres");
        if (nombre.length > 100) throw new Error("El nombre no es valido debe ser menor a 100 caracteres");
        if (nombre.length === 0) throw new Error("El nombre no puede ser vacío");

        const response = await cursoModel.create(req.body);

        res.status(200).json(response)

    } catch (error) {
        next(error)
    }
}


export const updateCurso = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {

        const { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area } = req.body;

        if(!cod || !nombre || !cupo || !cantidad_horas || !medio_inscripcion || !plataforma_dictado || !tipo_capacitacion || !area) throw new Error("Hay campos vacios");

        //EL cupo y cantida de horas deben ser enteros no debe admitir decimales. También debe sen mayor a 0
        if(cupo < 1 || isNaN(cupo)) throw new Error("El cupo debe ser mayor a 0");
        if(cantidad_horas < 1 || isNaN(cantidad_horas)) throw new Error("La cantidad de horas debe ser mayor a 0");

        //cupo debe ser un entero
        if(!Number.isInteger(Number(cupo))) throw new Error("El cupo debe ser un entero");
        if(!Number.isInteger(Number(cantidad_horas))) throw new Error("La cantidad de horas debe ser un entero");
        
        //Buscamos curso antes de actualizar
        const cursoAntes = await cursoModel.findOne({ where: { cod: cod } });
        if (!cursoAntes) {
            throw new Error(`No se encontró un curso con el código ${cod}`);
        }

        const cursoAntesJSON = cursoAntes.toJSON();

       const result = await cursoModel.update(
            { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area },
            {
                where: {
                    cod: cod,
                },
            },
        );
        
        if (result[0] === 0) {
            throw new Error("No hubo actualización de datos");
        }

         // Si se actualizó correctamente en la base de datos, actualiza Google Sheets
         console.log("Valor anterior:", cursoAntesJSON.nombre);
         console.log("Nuevo valor:", nombre);
        const resultadoGoogleSheets = await actualizarDatosColumna('Nombre del curso', cursoAntesJSON.nombre, nombre);

        if (!resultadoGoogleSheets.success) {
            throw new Error(`Error al actualizar en Google Sheets: ${resultadoGoogleSheets.error}`);
        }
        res.status(200).json({ message: "Se actualizo correctamente el curso" })


    } catch (error) {
        next(error)
    }
}


export const deleteCurso = async (req, res, next) => {
    try {
        const { cod } = req.params;

       

        if (!cod) {
            throw new Error("El ID del curso es requerido");
        }
        const response = await cursoModel.destroy({
            where: {
                cod
            }
        });
        if (response === 0) {
            throw new Error("No se pudo borrar el curso");
        }
        res.status(200).json({ message: "Se borro correctamente el curso" })
    } catch (error) {
        next(error)
    }
}