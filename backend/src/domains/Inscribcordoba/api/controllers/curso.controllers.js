import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import areaModel from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";
import { Op } from "sequelize";

import sequelize from "../../../../config/database.js";
import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import parseEsVigente from "../../../../utils/parseEsVigente.js"
import AppError from "../../../../utils/appError.js"

export const getCursos = async (req, res, next) => {
    try {
        // Obtener los valores del token
        const { rol, area, cuil } = req.user.user;

        // Filtro

        const { busqueda } = req.query;

        let where = {};

        if (busqueda) {
            where = {
                nombre: {
                    [Op.like]: `%${busqueda}%`
                }
            };
        }
        // Validar datos del usuario
        if (!cuil || !rol) {
            const error = new Error("No se encontraron los datos del usuario (rol o cuil)");
            error.statusCode = 404;
            throw new AppError("Error en get Cursos ", 400);
        }

        // Obtener áreas asignadas al usuario
        const areasAsignadas = await AreasAsignadasUsuario.findAll({
            where: { usuario: cuil }

        });
        let cursos;

        if (rol === "ADM" || rol === "GA") {
            cursos = await cursoModel.findAll({
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
                ],
                where: where
            });
        } else {
            // Validar área para roles no administradores
            if (!area) {
                throw new AppError("No se encontraron los datos del usuario (area) ", 404);
            }
            // Crear lista de códigos de área
            const codigosArea = [area];
            if (areasAsignadas.length > 0) {
                areasAsignadas.forEach(areaAsignada => {
                    codigosArea.push(areaAsignada.area);
                });
            }

            cursos = await cursoModel.findAll({
                where: {
                    area: {
                        [Op.in]: codigosArea // Filtrar áreas que coincidan con alguno de los códigos en la lista
                    }
                },
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
        }

        if (cursos.length === 0) {
            throw new AppError("No existen cursosr", 404);
        }

        res.status(200).json(cursos)
    } catch (error) {
        next(error)
    }
}

export const postCurso = async (req, res, next) => {
    try {

        const { cod,
            nombre,
            cupo,
            cantidad_horas,
            medio_inscripcion,
            plataforma_dictado,
            tipo_capacitacion,
            area,
        } = req.body;


        const existe = await cursoModel.findOne({ where: { cod: cod } });
        if (existe) throw new AppError("El Código ya existe", 400);
        if (cod.length > 15) throw new AppError("El Código no es valido debe ser menor a 15 caracteres", 400);
        if (cupo < 1 || isNaN(cupo)) throw new AppError("El cupo debe ser mayor a 0", 400);
        if (cantidad_horas < 1 || isNaN(cantidad_horas)) throw new AppError("La cantidad de horas debe ser mayor a 0", 400);
        if (medio_inscripcion.length > 15) throw new AppError("El medio de inscripción no es valido debe ser menor a 15 caracteres", 400);
        if (plataforma_dictado.length > 15) throw new AppError("La plataforma de dictado no es valido debe ser menor a 15 caracteres", 400);
        if (tipo_capacitacion.length > 15) throw new AppError("El tipo de capacitación no es valido debe ser menor a 15 caracteres", 400);
        if (area.length > 15) throw new AppError("El area no es valido debe ser menor a 15 caracteres", 400);
        if (nombre.length > 250) throw new AppError("El nombre no es valido debe ser menor a 250 caracteres", 400);
        if (nombre.length === 0) throw new AppError("El nombre no puede ser vacío", 400);

        const response = await cursoModel.create(req.body);

        res.status(200).json(response)

    } catch (error) {
        next(error)
    }
}


/**
 * Función reutilizable para actualizar un curso en la base de datos.
 * Puede ser invocada desde cualquier controlador, recibiendo una transacción externa.
 *
 * @param {Object} cursoData - Objeto con los campos del curso a actualizar.
 * @param {string} cod - Código identificador del curso.
 * @param {Object} transaction - Instancia de transacción de Sequelize.
 * @returns {Object} Resultado de la operación de update.
 * @throws {AppError} Si no se actualizó ninguna fila.
 */
export const actualizarCursoDB = async (cursoData, cod, transaction) => {
    const result = await cursoModel.update(
        cursoData,
        {
            where: { cod },
            transaction
        }
    );


    return result;
};

/**
 * Arma el objeto de datos del curso a partir del body del request.
 * Centraliza la extracción y normalización de campos para evitar duplicación.
 * Acepta tanto 'cod' como 'curso' como identificador del curso.
 *
 * @param {Object} body - req.body con los campos del curso.
 * @returns {Object} Objeto listo para pasar a actualizarCursoDB.
 */
export const buildCursoData = (body) => {
    const {
        cod, curso, nombre, cupo, cantidad_horas,
        medio_inscripcion, plataforma_dictado,
        tipo_capacitacion, area, esVigente,
        tiene_evento_creado, numero_evento,
        esta_maquetado, esta_configurado,
        aplica_sincronizacion_certificados,
        url_curso, esta_autorizado
    } = body;

    return {
        cod: cod || curso, // Acepta ambos nombres de campo
        curso: curso || cod,
        nombre,
        cupo,
        cantidad_horas,
        medio_inscripcion,
        plataforma_dictado,
        tipo_capacitacion,
        area,
        esVigente,
        tiene_evento_creado,
        numero_evento,
        esta_maquetado,
        esta_configurado,
        aplica_sincronizacion_certificados,
        url_curso: url_curso || null,
        esta_autorizado
    };
};


export const updateCurso = async (req, res, next) => {

    const t = await sequelize.transaction();

    try {
        const cursoData = buildCursoData(req.body);

        await actualizarCursoDB(cursoData, cursoData.cod, t);

        // --- Commit de la transacción y respuesta al cliente ---
        await t.commit();

        res.status(200).json({ message: "Se actualizo correctamente el curso" });

    } catch (error) {
        if (t && !t.finished) {
            try {
                await t.rollback();
            } catch (rollbackError) {
                console.error('Sequelize Rollback Error: Error al intentar revertir la transacción:', rollbackError);
            }
        }

        next(error);
    }
};


export const deleteCurso = async (req, res, next) => {
    try {
        const { cod } = req.params;



        if (!cod) {
            throw new AppError("El ID del curso es requerido", 400);
        }
        const response = await cursoModel.destroy({
            where: {
                cod
            }
        });
        if (response === 0) {
            throw new AppError("No se pudo borrar el curso", 400);
        }
        res.status(200).json({ message: "Se borro correctamente el curso" })
    } catch (error) {
        next(error)
    }
}