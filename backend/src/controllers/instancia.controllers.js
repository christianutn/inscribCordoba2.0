import instanciaModel from "../models/instancia.models.js";
import Curso from "../models/curso.models.js";
import Estado_Instancia from "../models/estado_instancia.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import validarFormatoFecha from "../utils/validarFormatoFecha.js";
import Persona from "../models/persona.models.js";
import sequelize from "../config/database.js";
import { QueryTypes, Model, DataTypes } from 'sequelize'; // Necesitas DataTypes si defines el modelo aquí
import TutoresXInstancia from "../models/tutorXInstancia.models.js";
import { DateTime } from 'luxon';
import AppError from "../utils/appError.js";



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
                    model: Estado_Instancia, as: 'detalle_estado_instancia'

                }
            ]
        });

        if (instancias.length === 0) {

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
    const t = await sequelize.transaction();

    try {
        const {
            curso,
            medio_inscripcion,
            plataforma_dictado,
            tipo_capacitacion,
            cupo,
            horas,
            cohortes,
            tutores,
            opciones,
            comentario
        } = req.body;


        // cuil del usaurio que hizo la solicitud
        const cuilUsuario = req.user.user.cuil
        if (!cuilUsuario) {
            throw new Error("No se pudo obtener el cuil del usuario")
        }

        const nombreUsuario = req.user.user.nombre
        if (!nombreUsuario) {
            throw new Error("No se pudo obtener el nombre del usuario")
        }

        const apellidoUsuario = req.user.user.apellido
        if (!apellidoUsuario) {
            throw new Error("No se pudo obtener el apellido del usuario")
        }
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

            // Crear la instancia
            await instanciaModel.create({
                curso: curso,
                fecha_inicio_inscripcion: fechaInscripcionDesde,
                fecha_fin_inscripcion: fechaInscripcionHasta,
                fecha_inicio_curso: fechaCursadaDesde,
                fecha_fin_curso: fechaCursadaHasta,
                estado_instancia: "PEND",
                medio_inscripcion: medio_inscripcion,
                plataforma_dictado: plataforma_dictado,
                tipo_capacitacion: tipo_capacitacion,
                cupo: cupo,
                cantidad_horas: horas,
                comentario: comentario,
                cuil_creador: cuilUsuario,
                es_autogestionado: opciones.autogestionado,
                tiene_correlatividad: opciones.correlatividad,
                tiene_restriccion_edad: opciones.edad,
                tiene_restriccion_departamento: opciones.departamento,
                es_publicada_portal_cc: opciones.publicaCC,
                cantidad_horas: horas,
                comentario: comentario,
                datos_solictud: datos_solicitud


            }, { transaction: t });

            // Procesar tutores
            for (const tutor of tutores) {
                const existeTutor = await Persona.findOne({ where: { cuil: tutor.cuil } });
                if (!existeTutor) {
                    throw crearError(404, "El tutor no existe");
                }

                await TutoresXInstancia.create({
                    cuil: tutor.cuil,
                    curso: req.body.curso,
                    fecha_inicio_curso: fechaCursadaDesde
                }, { transaction: t });
            }
        }


        await t.commit();
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


export const supera_cupo_mes = async (req, res, next) => {
    try {
        const { fechaCursadaDesde } = req.params;
        const superaCupoMes = await instanciaModel.supera_cupo_mes(fechaCursadaDesde);
        res.status(200).json(superaCupoMes);

    } catch (error) {
        next(error);
    }
}

export const supera_cupo_dia = async (req, res, next) => {
    try {
        const { fechaCursadaDesde } = req.params;
        const superaCupoDia = await instanciaModel.supera_cupo_dia(fechaCursadaDesde);
        res.status(200).json(superaCupoDia);

    } catch (error) {
        next(error);
    }
}

export const supera_cantidad_cursos_acumulado = async (req, res, next) => {
    try {
        const { fechaCursadaDesde } = req.params;
        const superaCupoDia = await instanciaModel.supera_cantidad_cursos_acumulado(fechaCursadaDesde);
        res.status(200).json(superaCupoDia);
    } catch (error) {
        next(error);
    }
}

export const supera_cantidad_cursos_mes = async (req, res, next) => {
    try {
        const { fechaCursadaDesde } = req.params;
        const superaCupoDia = await instanciaModel.supera_cantidad_cursos_mes(fechaCursadaDesde);
        res.status(200).json(superaCupoDia);
    } catch (error) {
        next(error);
    }
}


export const supera_cantidad_cursos_dia = async (req, res, next) => {
    try {
        const { fechaCursadaDesde } = req.params;
        const superaCupoDia = await instanciaModel.supera_cantidad_cursos_dia(fechaCursadaDesde);
        res.status(200).json(superaCupoDia);
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