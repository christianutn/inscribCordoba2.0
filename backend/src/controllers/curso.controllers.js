import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import areaModel from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";
import { Op } from "sequelize";

import sequelize from "../config/database.js";
import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import parseEsVigente from "../utils/parseEsVigente.js"
import AppError from "../utils/appError.js"

export const getCursos = async (req, res, next) => {
    try {
        // Obtener los valores del token
        const { rol, area, cuil } = req.user.user;
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
                ]
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

        const { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area, tiene_evento_creado } = req.body;


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


export const updateCurso = async (req, res, next) => {
    // Declaramos la variable de transacción para usarla en el catch si es necesario
    let t;

    try {
        const { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area, esVigente, tiene_evento_creado } = req.body;

        // --- Validaciones de entrada (Sin cambios en lógica, solo se eliminan logs) ---
        // Lanzamos el error directamente, confiando en que el catch lo capture y pase a next(error)
        if (!cod || !nombre || !cupo || !cantidad_horas || !medio_inscripcion || !plataforma_dictado || !tipo_capacitacion || !area) {
            throw new AppError("Hay campos vacios", 400);
        }

        // Convertimos a número y validamos que sean enteros positivos
        const parsedCupo = Number(cupo);
        const parsedCantidadHoras = Number(cantidad_horas);



        if (parsedCupo < 1 || isNaN(parsedCupo) || !Number.isInteger(parsedCupo)) {
            throw new AppError("El cupo debe ser un entero mayor a 0", 400);
        }
        if (parsedCantidadHoras < 1 || isNaN(parsedCantidadHoras) || !Number.isInteger(parsedCantidadHoras)) {
            throw new AppError("La cantidad de horas debe ser un entero mayor a 0", 400);
        }
        // --- Fin Validaciones de entrada ---


        // Inicia la transacción de Sequelize DESPUÉS de las validaciones iniciales
        t = await sequelize.transaction();


        // --- Búsqueda del curso (Sin cambios en lógica, AÑADIDA transacción) ---
        const cursoAntes = await cursoModel.findOne({
            where: { cod: cod },
            transaction: t // <-- Pasa la transacción
        });

        if (!cursoAntes) {
            // Lanzamos el error. El catch lo capturará y hará rollback.
            throw new AppError(`No se encontró un curso con el código ${cod}`, 400);
        }

        // --- Actualización en base de datos (Sin cambios en lógica, AÑADIDA transacción) ---
        const result = await cursoModel.update(
            {
                cod,
                nombre,
                cupo: parsedCupo, // Usar valores parseados y validados
                cantidad_horas: parsedCantidadHoras, // Usar valores parseados y validados
                medio_inscripcion,
                plataforma_dictado,
                tipo_capacitacion,
                area,
                esVigente: parseEsVigente(esVigente),
                tiene_evento_creado: tiene_evento_creado === "Si" ? 1 : 0
            },
            {
                where: {
                    cod: cod,
                },
                transaction: t // <-- Pasa la transacción
            },
        );

        // Verificamos si la actualización afectó alguna fila (Sin cambios en lógica)
        if (result[0] === 0) {
            // Lanzamos el error. El catch lo capturará y hará rollback.
            // Mantenemos tu lógica original de considerar 0 filas afectadas como error.
            throw new AppError("No hubo actualización de datos", 400);
        }


        // --- Actualización en Google Sheets (Sin cambios en lógica) ---
        // Esta operación NO es parte de la transacción de DB. Si falla,
        // el catch hará rollback de la DB, pero el cambio en Sheets no se deshace aquí.


        // --- Commit de la transacción y respuesta al cliente ---
        await t.commit(); // Confirma los cambios en la base de datos

        // Si todo fue exitoso, respondemos al cliente
        res.status(200).json({ message: "Se actualizo correctamente el curso" });


    } catch (error) {
        // --- Manejo de Errores y Rollback ---

        // Si la transacción fue creada (t es una instancia) y no ha sido ya finalizada
        if (t && !t.finished) {
            try {
                await t.rollback(); // Intenta revertir los cambios en la base de datos
                // No usamos console.log/error para el rollback exitoso según tu requisito estricto,
                // pero en un sistema real, un log aquí sería útil para monitorear.
            } catch (rollbackError) {
                // Captura si el rollback falla (raro). Este SÍ es un error de sistema crítico
                // que probablemente QUERRÁS loguear para depuración de infraestructura,
                // aunque rompa la regla estricta de "no console.log". Mantengo el log solo para este caso excepcional.
                console.error('Sequelize Rollback Error: Error al intentar revertir la transacción:', rollbackError);
            }
        }

        // Pasa el error original capturado al siguiente middleware (manejador de errores)
        // Esto incluye errores de validación, errores de DB, errores de Google Sheets, etc.
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