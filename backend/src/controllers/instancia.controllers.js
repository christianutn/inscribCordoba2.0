import instanciaModel from "../models/instancia.models.js";
import Curso from "../models/curso.models.js";
import Estado_Instancia from "../models/estado_instancia.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import MedioInscripcion from "../models/medioInscripcion.models.js";
import TipoCapacitacion from "../models/tipoCapacitacion.models.js";
import PlataformaDictado from "../models/plataformaDictado.models.js";
import Persona from "../models/persona.models.js";
import sequelize from "../config/database.js";
import { QueryTypes, Model, DataTypes } from 'sequelize'; // Necesitas DataTypes si defines el modelo aquí
import TutoresXInstancia from "../models/tutorXInstancia.models.js";
import { DateTime } from 'luxon';
import AppError from "../utils/appError.js";
import Usuario from "../models/usuario.models.js";
import Rol from "../models/rol.models.js";
import logger from '../utils/logger.js';

export const getInstancias = async (req, res, next) => {
    try {
        const instancias = await instanciaModel.findAll({
            include: [
                {
                    model: Curso, as: 'detalle_curso',
                    include: [
                        {
                            model: MedioInscripcion, as: 'detalle_medioInscripcion'
                        },
                        {
                            model: TipoCapacitacion, as: 'detalle_tipoCapacitacion'
                        },
                        {
                            model: PlataformaDictado, as: 'detalle_plataformaDictado'
                        },
                        {
                            model: Area,
                            as: 'detalle_area',
                            include: [
                                { model: Ministerio, as: 'detalle_ministerio' }
                            ]
                        },

                    ]

                },

                {
                    model: Usuario, as: 'detalle_asignado',
                    include: [
                        {
                            model: Persona, as: 'detalle_persona'
                        },
                        {
                            model: Rol, as: 'detalle_rol'
                        },
                        {
                            model: Area, as: 'detalle_area'
                        }
                    ]
                }

            ]
        });
        // No necesitas llamar a .json() sobre instancias, simplemente devuélvelo como JSON
        // res.status(200).json(instancias) ya lo hace correctamente
        if (instancias.length === 0) {
            throw new AppError("No existen instancias", 404);
        }

        res.status(200).json(instancias)
    } catch (error) {
        next(error)
    }
}

export const postInstancia = async (req, res, next) => {
    const t = await sequelize.transaction();

    const nombreUsuario = req.user.user.nombre;
    const apellidoUsuario = req.user.user.apellido;
    const cuilUsuario = req.user.user.cuil;
    try {
        const {
            curso,
            medio_inscripcion,
            plataforma_dictado,
            tipo_capacitacion,
            cupo,
            cantidad_horas,
            cohortes,
            tutores,
            opciones,
            comentario
        } = req.body;



        // variable que guarda fecha y hora exacta en horas y minutos nada mas en que se ejecuta
        const fechaActual = DateTime.now().setZone('America/Argentina/Buenos_Aires');
        const fechaFormateada = fechaActual.toFormat('dd/MM/yyyy HH:mm');

        const datos_solicitud =
            `Usuario: ${nombreUsuario} ${apellidoUsuario} | ` +
            `Cuil: ${cuilUsuario} | ` +
            `Fecha y Hora: ${fechaFormateada}`;


        for (const cohorte of cohortes) {
            const {
                fechaInscripcionDesde,
                fechaInscripcionHasta,
                fechaCursadaDesde,
                fechaCursadaHasta,
            } = cohorte;

            //COntrolar si existe fecha cursada para esta fecha
            const existeInstancia = await instanciaModel.findOne({
                where: {
                    curso: curso,
                    fecha_inicio_curso: fechaCursadaDesde
                }
                    
            })

            if (existeInstancia) {
                throw new AppError(`Ya existe una instancia con el mismo curso y fecha de cursada.`, 400);
            }

            // Crear la instancia
            await instanciaModel.create({
                curso: curso,
                fecha_inicio_inscripcion: fechaInscripcionDesde,
                fecha_fin_inscripcion: fechaInscripcionHasta,
                fecha_inicio_curso: fechaCursadaDesde,
                fecha_fin_curso: fechaCursadaHasta,
                es_publicada_portal_cc: opciones.publicaPCC ? 1 : 0,
                cupo: cupo,
                cantidad_horas: cantidad_horas,
                es_autogestionado: opciones.autogestionado ? 1 : 0,
                tiene_correlatividad: opciones.correlatividad ? 1 : 0,
                tiene_restriccion_edad: opciones.edad ? 1 : 0,
                tiene_restriccion_departamento: opciones.departamento ? 1 : 0,
                datos_solictud: datos_solicitud,
                estado_instancia: "PEND",

                medio_inscripcion: medio_inscripcion,
                plataforma_dictado: plataforma_dictado,
                tipo_capacitacion: tipo_capacitacion,
                comentario: comentario,


            }, { transaction: t });

            // Procesar tutores
            for (const tutor of tutores) {
                const existeTutor = await Persona.findOne({ where: { cuil: tutor.cuil } });
                if (!existeTutor) {
                    throw new AppError(`El tutor con CUIL ${tutor.cuil} no existe`, 404);
                }

                await TutoresXInstancia.create({
                    cuil: tutor.cuil,
                    curso: curso,
                    fecha_inicio_curso: fechaCursadaDesde
                }, { transaction: t });
            }
        }


        await t.commit();
        logger.info(`Instancias y tutores creados exitosamente por ${nombreUsuario || 'N/A'} ${apellidoUsuario || 'N/A'}: (Curso: ${curso}, Fecha Inicio/Fin: ${fecha_inicio_curso}/${fecha_fin_curso}`);
        res.status(201).json({ message: "Instancias y tutores creados exitosamente" });

    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// Función auxiliar para crear errores con un código de estado específico
function crearError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

export const deleteInstancia = async (req, res, next) => {
    try {
        const { curso, fecha_inicio_curso } = req.body;

        //Buscamos tutores por instancia

        const instancia = await instanciaModel.findOne({
            where: {
                curso,
                fecha_inicio_curso
            }
        });

        if (!instancia) {
            const error = new Error("La instancia no existe");
            error.statusCode = 404;
            throw error;
        }

        await instancia.destroy();
        res.status(200).json({ message: "Instancia eliminada" });
    } catch (error) {
        next(error);
    }
}

export const get_fechas_invalidas = async (req, res, next) => {
    const targetYear = req.params.targetYear

    try {
        // 1. Determinar el último año de la tabla 'instancias'
        const maxFechaResult = await instanciaModel.findOne({
            attributes: [
                [sequelize.fn('MAX', sequelize.col('fecha_inicio_curso')), 'maxFecha']
            ],
            raw: true,
        });

        if (!maxFechaResult || !maxFechaResult.maxFecha) {
            console.log("No se encontraron instancias para determinar el último año. Devolviendo lista vacía.");
            return res.status(200).send([]);
        }


        console.log(`Año objetivo determinado dinámicamente: ${targetYear}`);

        // 2. Usar el año determinado en la consulta principal
        // Esta es TU consulta SQL, adaptada para replacements de Sequelize
        // (se eliminó "SET @target_year = 2025;" y se cambió @target_year por :target_year)
        const sqlQuery = `
            WITH RECURSIVE DatesCTE AS (
                SELECT DATE(CONCAT(:target_year, '-01-01')) AS calendario_fecha
                UNION ALL
                SELECT DATE_ADD(calendario_fecha, INTERVAL 1 DAY)
                FROM DatesCTE
                WHERE DATE_ADD(calendario_fecha, INTERVAL 1 DAY) <= DATE(CONCAT(:target_year, '-12-31'))
            ),
            ControlDataCTE AS (
                SELECT 
                    maximoCursosXMes, maximoCuposXMes, maximoCuposXDia,
                    maximoCursosXDia, maximoAcumulado, mesBloqueado
                FROM control_data_fecha_inicio_cursada
                LIMIT 1
            ),
            FilteredInstanciasCTE AS (
                SELECT
                    curso, fecha_inicio_curso, fecha_fin_curso, cupo, estado_instancia
                FROM instancias
                WHERE estado_instancia NOT IN ('SUSP', 'CANC')
                  AND YEAR(fecha_inicio_curso) = :target_year -- Usar el placeholder
            ),
            DailyMetricsCTE AS (
                SELECT
                    d.calendario_fecha,
                    COALESCE(COUNT(fi.curso), 0) AS total_cursos_dia_calc,
                    COALESCE(SUM(fi.cupo), 0) AS total_cupos_dia_calc
                FROM DatesCTE d
                LEFT JOIN FilteredInstanciasCTE fi ON fi.fecha_inicio_curso = d.calendario_fecha
                GROUP BY d.calendario_fecha
            ),
            MonthlyMetricsCTE AS (
                SELECT
                    YEAR(fi.fecha_inicio_curso) AS anio,
                    MONTH(fi.fecha_inicio_curso) AS mes,
                    COALESCE(COUNT(fi.curso), 0) AS total_cursos_mes_calc,
                    COALESCE(SUM(fi.cupo), 0) AS total_cupos_mes_calc
                FROM FilteredInstanciasCTE fi
                WHERE YEAR(fi.fecha_inicio_curso) = :target_year -- Usar el placeholder
                GROUP BY YEAR(fi.fecha_inicio_curso), MONTH(fi.fecha_inicio_curso)
            ),
            AccumulatedCoursesCTE AS (
                SELECT
                    d.calendario_fecha,
                    COALESCE(COUNT(fi.curso), 0) AS total_acumulado_dia_calc
                FROM DatesCTE d
                LEFT JOIN instancias fi ON fi.fecha_inicio_curso <= d.calendario_fecha 
                                       AND fi.fecha_fin_curso > d.calendario_fecha
                                       AND fi.estado_instancia NOT IN ('SUSP', 'CANC')
                GROUP BY d.calendario_fecha
            )
            SELECT DISTINCT
                d.calendario_fecha,
                dm.total_cursos_dia_calc AS totalCursosPorDia,
                ctrl.maximoCursosXDia AS limiteCursosPorDia, -- Renombrado para claridad
                dm.total_cupos_dia_calc AS totalCuposPorDia,
                ctrl.maximoCuposXDia AS limiteCuposPorDia,   -- Renombrado para claridad
                COALESCE(mm.total_cursos_mes_calc, 0) AS totalCursosPorMes,
                ctrl.maximoCursosXMes AS limiteCursosPorMes, -- Renombrado para claridad
                COALESCE(mm.total_cupos_mes_calc, 0) AS totalCuposPorMes,
                ctrl.maximoCuposXMes AS limiteCuposPorMes,   -- Renombrado para claridad
                ac.total_acumulado_dia_calc AS totalAcumulado,
                ctrl.maximoAcumulado AS limiteAcumulado,     -- Renombrado para claridad
                MONTH(d.calendario_fecha) AS mesCalendario,
                ctrl.mesBloqueado,
                CASE
                    WHEN dm.total_cursos_dia_calc > ctrl.maximoCursosXDia THEN 'Supera cursos por día'
                    WHEN dm.total_cupos_dia_calc > ctrl.maximoCuposXDia THEN 'Supera cupos por día'
                    WHEN COALESCE(mm.total_cupos_mes_calc, 0) > ctrl.maximoCuposXMes THEN 'Supera cupos por mes'
                    WHEN COALESCE(mm.total_cursos_mes_calc, 0) > ctrl.maximoCursosXMes THEN 'Supera cursos por mes'
                    WHEN ac.total_acumulado_dia_calc > ctrl.maximoAcumulado THEN 'Supera acumulado'
                    WHEN MONTH(d.calendario_fecha) = ctrl.mesBloqueado THEN 'Mes bloqueado'
                    ELSE 'Válida'
                END AS motivo_invalidez
            FROM DatesCTE d
            JOIN ControlDataCTE ctrl ON 1=1
            LEFT JOIN DailyMetricsCTE dm ON d.calendario_fecha = dm.calendario_fecha
            LEFT JOIN MonthlyMetricsCTE mm ON MONTH(d.calendario_fecha) = mm.mes AND YEAR(d.calendario_fecha) = mm.anio
            LEFT JOIN AccumulatedCoursesCTE ac ON d.calendario_fecha = ac.calendario_fecha
            WHERE
                -- Solo procesar si targetYear no es null (DatesCTE estaría vacía de todas formas)
                (:target_year IS NOT NULL)
                AND (
                    dm.total_cursos_dia_calc > ctrl.maximoCursosXDia
                    OR dm.total_cupos_dia_calc > ctrl.maximoCuposXDia
                    OR COALESCE(mm.total_cupos_mes_calc, 0) > ctrl.maximoCuposXMes
                    OR COALESCE(mm.total_cursos_mes_calc, 0) > ctrl.maximoCursosXMes
                    OR ac.total_acumulado_dia_calc > ctrl.maximoAcumulado
                    OR MONTH(d.calendario_fecha) = ctrl.mesBloqueado
                )
            ORDER BY d.calendario_fecha;
        `;

        // Nota: Para que la CTE recursiva (DatesCTE) funcione correctamente en MySQL
        // a través de Sequelize, la variable de servidor MySQL 'cte_max_recursion_depth'
        // debe ser suficientemente alta (e.g., 1000 o al menos 366).
        // Si no está configurada globalmente, esta consulta podría fallar si el límite por defecto es bajo.
        // SET SESSION cte_max_recursion_depth no es fiable con pools de conexión.
        // Lo ideal es configurarlo a nivel de servidor.

        const results = await sequelize.query(sqlQuery, {
            replacements: { target_year: targetYear },
            type: QueryTypes.SELECT,
        });

        res.status(200).send(results);

    } catch (error) {
        console.error("Error al obtener detalles de fechas inválidas:", error);
        next(error);
    }
}

export const putInstancia = async (req, res, next) => {
    try {

        const { curso_params, fecha_inicio_curso_params } = req.params;

        const where = {}

        if (req.body.hasOwnProperty('fecha_inicio_curso')) where.fecha_inicio_curso = req.body.fecha_inicio_curso;
        if (req.body.hasOwnProperty('fecha_fin_curso')) where.fecha_fin_curso = req.body.fecha_fin_curso;
        if (req.body.hasOwnProperty('fecha_inicio_inscripcion')) where.fecha_inicio_inscripcion = req.body.fecha_inicio_inscripcion;
        if (req.body.hasOwnProperty('fecha_fin_inscripcion')) where.fecha_fin_inscripcion = req.body.fecha_fin_inscripcion;
        if (req.body.hasOwnProperty('es_publicada_portal_cc')) where.es_publicada_portal_cc = req.body.es_publicada_portal_cc;
        if (req.body.hasOwnProperty('estado_instancia')) where.estado_instancia = req.body.estado_instancia;
        if (req.body.hasOwnProperty('medio_inscripcion')) where.medio_inscripcion = req.body.medio_inscripcion;
        if (req.body.hasOwnProperty('plataforma_dictado')) where.plataforma_dictado = req.body.plataforma_dictado;
        if (req.body.hasOwnProperty('tipo_capacitacion')) where.tipo_capacitacion = req.body.tipo_capacitacion;
        if (req.body.hasOwnProperty('cupo')) where.cupo = req.body.cupo;
        if (req.body.hasOwnProperty('cantidad_horas')) where.cantidad_horas = req.body.cantidad_horas;
        if (req.body.hasOwnProperty('cohortes')) where.cohortes = req.body.cohortes;
        if (req.body.hasOwnProperty('tutores')) where.tutores = req.body.tutores;
        if (req.body.hasOwnProperty('opciones')) where.opciones = req.body.opciones;
        if (req.body.hasOwnProperty('comentario')) where.comentario = req.body.comentario;
        if (req.body.hasOwnProperty('es_autogestionado')) where.es_autogestionado = req.body.es_autogestionado;
        if (req.body.hasOwnProperty('tiene_correlatividad')) where.tiene_correlatividad = req.body.tiene_correlatividad;
        if (req.body.hasOwnProperty('tiene_restriccion_edad')) where.tiene_restriccion_edad = req.body.tiene_restriccion_edad;
        if (req.body.hasOwnProperty('tiene_restriccion_departamento')) where.tiene_restriccion_departamento = req.body.tiene_restriccion_departamento;
        if (req.body.hasOwnProperty('asignado')) where.asignado = req.body.asignado;
        if (req.body.hasOwnProperty('cantidad_inscriptos')) where.cantidad_inscriptos = req.body.cantidad_inscriptos

        // actualizar con where 
        const instancia = await instanciaModel.update(where, {
            where: {
                curso: curso_params,
                fecha_inicio_curso: fecha_inicio_curso_params
            }
        });
        res.status(200).send(instancia);
    } catch (error) {
        next(new AppError("Error al actualizar la instancia", 500));
    }
}