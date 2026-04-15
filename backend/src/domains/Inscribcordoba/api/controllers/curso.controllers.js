import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import areaModel from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";
import estadoCursoModel from "../models/estado_curso.models.js";
import { Op } from "sequelize";

import sequelize from "../../../../config/database.js";
import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import parseEsVigente from "../../../../utils/parseEsVigente.js"
import AppError from "../../../../utils/appError.js"
import CursoStateService from "../../core/services/CursoStateService.js"
import CursoStateContext from "../../core/states/curso/CursoStateContext.js";

// Mapa de estrategias / Action Map para reemplazar switches (Patrón Strategy Funcional)
const manejadoresDeEstado = {
    'avanzar': (cod, rol, dest, t) => CursoStateService.avanzar(cod, t),
    'retroceder': (cod, rol, dest, t) => CursoStateService.retroceder(cod, rol, t),
    'darDeBaja': (cod, rol, dest, t) => CursoStateService.darDeBaja(cod, rol, t),
    'marcarPendienteCargaEnVictorius': (cod, rol, dest, t) => CursoStateService.marcarPendienteCargaEnVictorius(cod, t),
    'marcarEventoCreadoEnVictorius': (cod, rol, dest, t) => CursoStateService.marcarEventoCreadoEnVictorius(cod, t),
    'restaurar': (cod, rol, dest, t) => CursoStateService.restaurar(cod, rol, dest, t)
};


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
                        model: estadoCursoModel, as: 'detalle_estado_curso'
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
                        model: estadoCursoModel, as: 'detalle_estado_curso'
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
            area
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

        // El estado inicial se obtiene explícitamente desde la máquina de estados.
        // Esto conceptualmente representa el "avanzar" de la nada hacia el estado de inicio.
        const estadoInicial = CursoStateContext.getEstadoInicial();

        const response = await cursoModel.create({
            cod,
            nombre,
            cupo,
            cantidad_horas,
            medio_inscripcion,
            plataforma_dictado,
            tipo_capacitacion,
            area,
            estado: estadoInicial
        });

        res.status(200).json(response)

    } catch (error) {
        next(error)
    }
}


/**
 * Función reutilizable para actualizar un curso en la base de datos.
 * Puede ser invocada desde cualquier controlador, recibiendo una transacción externa.
 *
 * IMPORTANTE: el campo 'estado' es excluido explícitamente del objeto de actualización.
 * Los cambios de estado SOLO deben realizarse a través de CursoStateService (patrón State).
 * Esto garantiza que ninguna actualización directa pueda bypassear la máquina de estados.
 *
 * @param {Object} cursoData - Objeto con los campos del curso a actualizar.
 * @param {string} cod - Código identificador del curso.
 * @param {Object} transaction - Instancia de transacción de Sequelize.
 * @returns {Object} Resultado de la operación de update.
 */
export const actualizarCursoDB = async (cursoData, cod, transaction) => {
    // Blindar el campo 'estado': se elimina del objeto para que no pueda
    // ser modificado directamente. Solo CursoStateService puede cambiarlo.
    const { estado: _estadoIgnorado, ...datosSegurosSinEstado } = cursoData;

    const result = await cursoModel.update(
        datosSegurosSinEstado,
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
 * NOTA: el campo 'estado' es intencionalmente omitido del objeto retornado.
 * Su modificación está delegada exclusivamente a CursoStateService (patrón State)
 * a través del endpoint PATCH /:cod/estado.
 *
 * @param {Object} body - req.body con los campos del curso.
 * @returns {Object} Objeto listo para pasar a actualizarCursoDB (sin campo 'estado').
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
        // 'estado' es ignorado intencionalmente: usa PATCH /:cod/estado para cambiarlo.
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
        // 'estado' NO se incluye aquí. Ver CursoStateService.
    };
};


export const updateCurso = async (req, res, next) => {

    const t = await sequelize.transaction();

    try {
        const cursoData = buildCursoData(req.body);
        const { accion } = req.body; // Extraemos la acción de estado si fue enviada
        const { rol } = req.user.user;

        // 1. Actualizamos los datos del curso (el estado es excluido automáticamente en buildCursoData y actualizarCursoDB)
        await actualizarCursoDB(cursoData, cursoData.cod, t);

        // 2. Si se solicitó un cambio de estado en la misma petición, lo procesamos usando el State pattern
        // (Delegamos a través del Patrón Strategy funcional del Diccionario)
        if (accion) {
            let baseAccion = accion;
            let estadoDestino = req.body.estadoDestino;
            
            // Retro-compatibilidad para extraer el destino si viene concatenado "restaurar_AUT"
            if (accion.startsWith('restaurar_')) {
                baseAccion = 'restaurar';
                estadoDestino = accion.split('_')[1];
            }

            const funcionEjecutora = manejadoresDeEstado[baseAccion];
            
            if (!funcionEjecutora) {
                throw new AppError(`Acción de estado desconocida o inválida: '${accion}'.`, 400);
            }

            await funcionEjecutora(cursoData.cod, rol, estadoDestino, t);
        }

        // --- Commit de la transacción y respuesta al cliente ---
        await t.commit();

        res.status(200).json({ message: "Se actualizó correctamente el curso y/o su estado" });

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


/**
 * PATCH /cursos/:cod/estado
 *
 * Cambia el estado de un curso siguiendo la máquina de estados:
 *   AUT → MAQ → CON → PVICT → EC
 *   Cualquier estado → NVIG  (solo ADM)
 *
 * Body: { accion: 'avanzar' | 'retroceder' | 'darDeBaja' }
 *
 * Permisos:
 *   - avanzar   → cualquier rol autenticado
 *   - retroceder → solo ADM
 *   - darDeBaja  → solo ADM
 */
export const patchEstadoCurso = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const { accion } = req.body;
        const { rol } = req.user.user;

        if (!cod) {
            throw new AppError('El código del curso es requerido.', 400);
        }
        if (!accion) {
            throw new AppError('El campo accion es requerido.', 400);
        }

        let baseAccion = accion;
        let estadoDestino = req.body.estadoDestino;
        
        // Retro-compatibilidad para "restaurar_AUT"
        if (accion.startsWith('restaurar_')) {
            baseAccion = 'restaurar';
            estadoDestino = accion.split('_')[1];
        }

        const funcionEjecutora = manejadoresDeEstado[baseAccion];
        
        if (!funcionEjecutora) {
            throw new AppError(`Acción de estado desconocida o inválida: '${accion}'.`, 400);
        }

        // Ejecuta el closure apuntado en el mapa
        const result = await funcionEjecutora(cod, rol, estadoDestino);
        const { estadoAnterior, estadoNuevo } = result;

        res.status(200).json({
            message: `Estado del curso actualizado correctamente.`,
            cod,
            estadoAnterior,
            estadoNuevo
        });
    } catch (error) {
        next(error);
    }
};