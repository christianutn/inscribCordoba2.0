// --- Contenido completo y CORRECTO para: instancia.controllers.js ---

import instanciaModel from "../models/instancia.models.js";
import Persona from "../models/persona.models.js";
import sequelize from "../../../../config/database.js";
import { fn, QueryTypes } from 'sequelize';
import TutoresXInstancia from "../models/tutorXInstancia.models.js";
import { DateTime } from 'luxon';
import AppError from "../../../../utils/appError.js";
import Usuario from "../models/usuario.models.js";
import logger from '../../../../utils/logger.js';
import RestriccionesPorCorrelatividad from "../models/restricciones_por_correlatividad.models.js";
import RestriccionesPorDepartamento from "../models/restricciones_por_departamento.models.js";
import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import CursoModel from "../models/curso.models.js"
import Curso from "../models/curso.models.js";

export const getInstancias = async (req, res, next) => {
    try {
        logger.info('📋 Iniciando consulta de instancias');

        // 1. Obtener los valores del token
        const { rol, area: areaPrincipal, cuil } = req.user.user;

        logger.info(`👤 Usuario consultando: ${cuil} - Rol: ${rol} - Área: ${areaPrincipal || 'N/A'}`);

        // 2. Crear la lista de áreas permitidas para el usuario
        //    Esta lógica se ejecuta para todos los roles, pero solo se usará para filtrar si no es ADM/GA.

        // Validar que el área principal del usuario exista si no es un rol de super admin.
        if (!areaPrincipal && rol !== 'ADM' && rol !== 'GA') {
            const error = new Error("El usuario no tiene un área principal asignada.");
            error.statusCode = 404; // 404 o 403 podría ser apropiado
            throw error;
        }

        const areasAsignadas = await AreasAsignadasUsuario.findAll({
            where: { usuario: cuil },
            // El 'include' no es estrictamente necesario para obtener los códigos, 
            // pero lo mantenemos si lo usas para otros fines.
            attributes: ['area']
        });

        // Crear un Set para un rendimiento óptimo en la búsqueda (mejor que .includes() en arrays grandes)
        const codigosAreaPermitidos = new Set();
        if (areaPrincipal) {
            codigosAreaPermitidos.add(areaPrincipal);
        }
        areasAsignadas.forEach(areaAsignada => {
            codigosAreaPermitidos.add(areaAsignada.area);
        });

        // 3. Ejecutar la consulta SQL (sin cambios)
        const query = `
        SELECT
            i.curso,
            i.fecha_inicio_curso,
            i.fecha_fin_curso,
            i.fecha_inicio_inscripcion,
            i.fecha_fin_inscripcion,
            i.es_publicada_portal_cc,
            i.cupo,
            i.cantidad_horas,
            i.es_autogestionado,
            i.tiene_correlatividad,
            i.tiene_restriccion_edad,
            i.tiene_restriccion_departamento,
            i.datos_solictud,
            i.estado_instancia,
            i.medio_inscripcion,
            i.plataforma_dictado,
            i.tipo_capacitacion,
            i.comentario,
            i.asignado,
            i.cantidad_inscriptos,
            i.cantidad_certificados,
            i.fecha_suba_certificados,
            i.restriccion_edad_desde,
            i.restriccion_edad_hasta,
            (
                SELECT JSON_OBJECT(
                    'cod', c.cod, 'nombre', c.nombre, 'cupo', c.cupo, 'cantidad_horas', c.cantidad_horas,
                    'medio_inscripcion', c.medio_inscripcion, 'plataforma_dictado', c.plataforma_dictado,
                    'tipo_capacitacion', c.tipo_capacitacion, 'area', c.area, 'esVigente', c.esVigente,
                    'tiene_evento_creado', c.tiene_evento_creado, 'es_autogestionado', c.es_autogestionado,
                    'tiene_restriccion_edad', c.tiene_restriccion_edad,
                    'tiene_restriccion_departamento', c.tiene_restriccion_departamento, 'publica_pcc', c.publica_pcc,
                    'tiene_correlatividad', c.tiene_correlatividad, 'numero_evento', c.numero_evento,
                    'esta_maquetado', c.esta_maquetado, 'esta_configurado', c.esta_configurado,
                    'aplica_sincronizacion_certificados', c.aplica_sincronizacion_certificados, 'url_curso', c.url_curso,
                    'detalle_medioInscripcion', (SELECT JSON_OBJECT('cod', mi.cod, 'nombre', mi.nombre, 'esVigente', mi.esVigente) FROM medios_inscripcion mi WHERE mi.cod = c.medio_inscripcion),
                    'detalle_tipoCapacitacion', (SELECT JSON_OBJECT('cod', tc.cod, 'nombre', tc.nombre, 'esVigente', tc.esVigente) FROM tipos_capacitacion tc WHERE tc.cod = c.tipo_capacitacion),
                    'detalle_plataformaDictado', (SELECT JSON_OBJECT('cod', pd.cod, 'nombre', pd.nombre, 'esVigente', pd.esVigente) FROM plataformas_dictado pd WHERE pd.cod = c.plataforma_dictado),
                    'detalle_area', (
                        SELECT JSON_OBJECT(
                            'cod', a.cod, 'nombre', a.nombre, 'ministerio', a.ministerio, 'esVigente', a.esVigente,
                            'detalle_ministerio', (SELECT JSON_OBJECT('cod', m.cod, 'nombre', m.nombre, 'esVigente', m.esVigente) FROM ministerios m WHERE m.cod = a.ministerio)
                        ) FROM areas a WHERE a.cod = c.area
                    )
                )
                FROM cursos c WHERE c.cod = i.curso
            ) AS detalle_curso,
            (
                SELECT JSON_OBJECT(
                    'cuil', u.cuil, 'contrasenia', u.contrasenia, 'rol', u.rol, 'area', u.area,
                    'necesitaCbioContrasenia', u.necesitaCbioContrasenia, 'esExcepcionParaFechas', u.esExcepcionParaFechas,
                    'detalle_persona', (SELECT JSON_OBJECT('cuil', p.cuil, 'nombre', p.nombre, 'apellido', p.apellido, 'mail', p.mail, 'celular', p.celular) FROM personas p WHERE p.cuil = u.cuil),
                    'detalle_rol', (SELECT JSON_OBJECT('cod', r.cod, 'nombre', r.nombre) FROM roles r WHERE r.cod = u.rol),
                    'detalle_area', (SELECT JSON_OBJECT('cod', a.cod, 'nombre', a.nombre) FROM areas a WHERE a.cod = u.area)
                )
                FROM usuarios u WHERE u.cuil = i.asignado
            ) AS detalle_asignado,
            (
                SELECT COALESCE(JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'curso', rpd.curso, 'fecha_inicio_curso', rpd.fecha_inicio_curso, 'departamento_id', rpd.departamento_id,
                        'detalle_departamento', (SELECT JSON_OBJECT('id', d.id, 'nombre', d.nombre) FROM departamentos d WHERE d.id = rpd.departamento_id)
                    )
                ), JSON_ARRAY())
                FROM restricciones_por_departamento rpd
                WHERE rpd.curso = i.curso AND rpd.fecha_inicio_curso = i.fecha_inicio_curso
            ) AS detalle_restricciones_por_departamento,
            (
                SELECT COALESCE(JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'curso', rpc.curso, 'fecha_inicio_curso', rpc.fecha_inicio_curso, 'curso_correlativo', rpc.curso_correlativo,
                        'detalle_curso', (SELECT JSON_OBJECT('cod', dc.cod, 'nombre', dc.nombre) FROM cursos dc WHERE dc.cod = rpc.curso),
                        'detalle_curso_correlativo', (SELECT JSON_OBJECT('cod', dcc.cod, 'nombre', dcc.nombre) FROM cursos dcc WHERE dcc.cod = rpc.curso_correlativo)
                    )
                ), JSON_ARRAY())
                FROM restricciones_por_correlatividad rpc
                WHERE rpc.curso = i.curso AND rpc.fecha_inicio_curso = i.fecha_inicio_curso
            ) AS detalle_restricciones_por_correlatividad
        FROM instancias i;
    `
        const [results] = await sequelize.query(query);

        // 4. Parsear los resultados JSON (sin cambios)
        const parsedResults = results.map(item => {
            const safelyParseJSON = (jsonString) => {
                if (typeof jsonString === 'string') {
                    try { return JSON.parse(jsonString); } catch (e) { return null; }
                }
                return jsonString;
            };
            return {
                ...item,
                detalle_curso: safelyParseJSON(item.detalle_curso),
                detalle_asignado: safelyParseJSON(item.detalle_asignado),
                detalle_restricciones_por_departamento: safelyParseJSON(item.detalle_restricciones_por_departamento),
                detalle_restricciones_por_correlatividad: safelyParseJSON(item.detalle_restricciones_por_correlatividad)
            };
        });

        // 5. Aplicar el filtro basado en el rol del usuario
        let finalResults;

        if (rol === 'ADM' || rol === 'GA') {
            // Si el rol es ADM o GA, no se aplica ningún filtro.
            finalResults = parsedResults;
        } else {
            // Para otros roles, filtrar los resultados.
            finalResults = parsedResults.filter(instancia => {
                // Usar encadenamiento opcional para evitar errores si las propiedades anidadas no existen
                const areaCod = instancia.detalle_curso?.detalle_area?.cod;

                // Si el área del curso existe y está en el set de áreas permitidas, mantener la instancia.
                return areaCod && codigosAreaPermitidos.has(areaCod);
            });
        }

        // 6. Enviar la respuesta
        logger.info(`✅ Instancias obtenidas exitosamente - Total: ${finalResults.length} registros - Filtrado por rol: ${rol}`);
        res.status(200).json(finalResults);

    } catch (error) {
        logger.error(`❌ Error en getInstancias - CUIL: ${req.user?.user?.cuil || 'N/A'} - Error: ${error.message}`, {
            stack: error.stack,
            cuil: req.user?.user?.cuil
        });
        next(error);
    }
};

export const postInstancia = async (req, res, next) => {
    const t = await sequelize.transaction();
    const usuario = req.user.user;

    try {
        logger.info('📝 Iniciando creación de instancia(s)');

        const {
            curso,
            medio_inscripcion,
            plataforma_dictado,
            tipo_capacitacion,
            cupo,
            cantidad_horas,
            cohortes,
            es_autogestionado,
            es_publicada_portal_cc,
            restriccion_edad_desde,
            restriccion_edad_hasta,
            departamentos,
            cursos_correlativos
        } = req.body;

        logger.info(`📚 Curso: ${curso} - Cohortes: ${cohortes?.length || 0} - Usuario: ${usuario.cuil}`);


        // Corroboramos que el curso este autorizado

        const cursoEncontrado = await Curso.findByPk(curso)

        if (!cursoEncontrado) {
            logger.warn(`⚠️ Intento de crear instancia con curso inexistente - Curso: ${curso}`);
            throw AppError(`El cursos con cod: ${curso}`, 400)
        }

        if (!cursoEncontrado.esta_autorizado) {
            logger.warn(`⚠️ Intento de crear instancia con curso no autorizado - Curso: ${curso}`);
            throw AppError(`El curso con cod: ${curso} no está autorizado`)
        }

        const fechaActual = DateTime.now().setZone('America/Argentina/Buenos_Aires');
        const fechaFormateada = fechaActual.toFormat('dd/MM/yyyy HH:mm');

        const datos_solicitud =
            `Usuario: ${usuario.nombre} ${usuario.apellido} | ` +
            `Cuil: ${usuario.cuil} | ` +
            `Fecha y Hora: ${fechaFormateada}`;

        for (const cohorte of cohortes) {
            let tiene_correlatividad = (cursos_correlativos && cursos_correlativos.length > 0) ? 1 : 0;
            let tiene_restriccion_departamento = (departamentos && departamentos.length > 0) ? 1 : 0;
            let tiene_restriccion_edad = (restriccion_edad_desde && restriccion_edad_hasta) ? 1 : 0;

            const {
                fechaInscripcionDesde,
                fechaInscripcionHasta,
                fechaCursadaDesde,
                fechaCursadaHasta,
            } = cohorte;

            const existeInstancia = await instanciaModel.findOne({
                where: {
                    curso: curso,
                    fecha_inicio_curso: fechaCursadaDesde
                }
            })

            if (existeInstancia) {
                logger.warn(`⚠️ Intento de crear instancia duplicada - Curso: ${curso} - Fecha: ${fechaCursadaDesde}`);
                throw new AppError(`Ya existe una instancia con el mismo curso y fecha de cursada.`, 400);
            }


            await instanciaModel.create({
                curso: curso,
                fecha_inicio_inscripcion: fechaInscripcionDesde,
                fecha_fin_inscripcion: fechaInscripcionHasta,
                fecha_inicio_curso: fechaCursadaDesde,
                fecha_fin_curso: fechaCursadaHasta,
                es_publicada_portal_cc: es_publicada_portal_cc,
                cupo: cupo,
                cantidad_horas: cantidad_horas,
                es_autogestionado: es_autogestionado,
                tiene_correlatividad: tiene_correlatividad,
                tiene_restriccion_edad: tiene_restriccion_edad,
                tiene_restriccion_departamento: tiene_restriccion_departamento,
                datos_solicitud: datos_solicitud,
                estado_instancia: "PEND",
                medio_inscripcion: medio_inscripcion,
                plataforma_dictado: plataforma_dictado,
                tipo_capacitacion: tipo_capacitacion,
                restriccion_edad_desde: restriccion_edad_desde,
                restriccion_edad_hasta: restriccion_edad_hasta || null

            }, { transaction: t });

            if (cursos_correlativos && cursos_correlativos.length > 0) {
                for (const correlativo of cursos_correlativos) {
                    await RestriccionesPorCorrelatividad.create({
                        curso: curso,
                        fecha_inicio_curso: fechaCursadaDesde,
                        curso_correlativo: correlativo
                    }, { transaction: t });
                }
            }

            if (departamentos && departamentos.length > 0) {
                for (const departamento of departamentos) {
                    await RestriccionesPorDepartamento.create({
                        curso: curso,
                        fecha_inicio_curso: fechaCursadaDesde,
                        departamento_id: departamento
                    }, { transaction: t });
                }
            }
        }

        await t.commit();

        logger.info(`✅ Instancia(s) creada(s) exitosamente - Usuario: ${usuario.cuil} - Curso: ${curso} - Cohortes: ${cohortes.length}`);
        res.status(201).json({ message: "Instancias creado exitosamente" });

    } catch (error) {
        await t.rollback();
        logger.error(`❌ Error al crear instancia - Usuario: ${usuario?.cuil || 'N/A'} - Curso: ${req.body.curso} - Error: ${error.message}`, {
            stack: error.stack,
            usuario: usuario?.cuil,
            curso: req.body.curso
        });
        next(error);
    }
};

export const deleteInstancia = async (req, res, next) => {
    const usuario = req.user.user;

    try {
        const { curso, fecha_inicio_curso } = req.body;

        logger.info(`🗑️ Intento de eliminación de instancia - Usuario: ${usuario.cuil} - Curso: ${curso} - Fecha: ${fecha_inicio_curso}`);
        const instancia = await instanciaModel.findOne({
            where: {
                curso,
                fecha_inicio_curso
            }
        });

        if (!instancia) {
            logger.warn(`⚠️ Eliminación fallida - Instancia no encontrada - Curso: ${curso} - Fecha: ${fecha_inicio_curso}`);
            const error = new Error("La instancia no existe");
            error.statusCode = 404;
            throw error;
        }

        await instancia.destroy();

        logger.info(`✅ Instancia eliminada exitosamente - Usuario: ${usuario.cuil} - Curso: ${curso} - Fecha: ${fecha_inicio_curso}`);
        res.status(200).json({ message: "Instancia eliminada" });

    } catch (error) {
        logger.error(`❌ Error al eliminar instancia - Usuario: ${usuario?.cuil || 'N/A'} - Error: ${error.message}`, {
            stack: error.stack,
            usuario: usuario?.cuil,
            curso: req.body.curso
        });
        next(error);
    }
};

export const get_fechas_invalidas = async (req, res, next) => {
    const targetYear = req.params.targetYear;
    let results = [];

    try {
        logger.info(`📅 Consulta de fechas inválidas - Año: ${targetYear}`);

        const cuil = req.user.user.cuil;
        const usuario = await Usuario.findByPk(cuil);
        const es_excepcion_para_fechas = parseInt(usuario.esExcepcionParaFechas);

        if (!es_excepcion_para_fechas) {
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
                WHERE estado_instancia NOT IN ('CANC')
                  AND YEAR(fecha_inicio_curso) = :target_year
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
                WHERE YEAR(fi.fecha_inicio_curso) = :target_year
                GROUP BY YEAR(fi.fecha_inicio_curso), MONTH(fi.fecha_inicio_curso)
            ),
            AccumulatedCoursesCTE AS (
                SELECT
                    d.calendario_fecha,
                    COALESCE(COUNT(fi.curso), 0) AS total_acumulado_dia_calc
                FROM DatesCTE d
                LEFT JOIN instancias fi ON fi.fecha_inicio_curso <= d.calendario_fecha 
                                       AND fi.fecha_fin_curso > d.calendario_fecha
                                       AND fi.estado_instancia NOT IN ('CANC')
                GROUP BY d.calendario_fecha
            )
            SELECT DISTINCT
                d.calendario_fecha,
                dm.total_cursos_dia_calc AS totalCursosPorDia,
                ctrl.maximoCursosXDia AS limiteCursosPorDia,
                dm.total_cupos_dia_calc AS totalCuposPorDia,
                ctrl.maximoCuposXDia AS limiteCuposPorDia,
                COALESCE(mm.total_cursos_mes_calc, 0) AS totalCursosPorMes,
                ctrl.maximoCursosXMes AS limiteCursosPorMes,
                COALESCE(mm.total_cupos_mes_calc, 0) AS totalCuposPorMes,
                ctrl.maximoCuposXMes AS limiteCuposPorMes,
                ac.total_acumulado_dia_calc AS totalAcumulado,
                ctrl.maximoAcumulado AS limiteAcumulado,
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

            results = await sequelize.query(sqlQuery, {
                replacements: { target_year: targetYear },
                type: QueryTypes.SELECT,
            });
        }

        logger.info(`✅ Fechas inválidas obtenidas - Año: ${targetYear} - Total: ${results.length} fechas`);
        res.status(200).send(results);
    } catch (error) {
        logger.error(`❌ Error al consultar fechas inválidas - Año: ${req.params.targetYear} - Error: ${error.message}`, {
            stack: error.stack,
            year: req.params.targetYear
        });
        next(error);
    }
};





const buildUpdateQuery = (body) => {
    const where = {};
    const properties = [
        'fecha_inicio_curso', 'fecha_fin_curso', 'fecha_inicio_inscripcion',
        'fecha_fin_inscripcion', 'es_publicada_portal_cc', 'estado_instancia',
        'medio_inscripcion', 'plataforma_dictado', 'tipo_capacitacion', 'cupo',
        'cantidad_horas', 'cohortes', 'tutores', 'opciones', 'comentario',
        'es_autogestionado', 'asignado', 'cantidad_inscriptos',
        'restriccion_edad_desde', 'restriccion_edad_hasta', 'cantidad_certificados'
    ];

    properties.forEach(prop => {
        if (body.hasOwnProperty(prop)) {
            where[prop] = body[prop];
        }
    });

    if (body.hasOwnProperty('restriccion_edad_desde') || body.hasOwnProperty('restriccion_edad_hasta')) {
        where.tiene_restriccion_edad = tratar_restriccion_por_edad(
            body.restriccion_edad_desde,
            body.restriccion_edad_hasta
        );
    }

    return where;
};

const updateRestricciones = async (model, body, params, transaction, field, values, fieldName) => {
    if (body.hasOwnProperty(field)) {
        await model.destroy({
            where: {
                curso: params.curso_params,
                fecha_inicio_curso: params.fecha_inicio_curso_params
            },
            transaction
        });

        for (const value of values) {
            await model.create({
                curso: params.curso_params,
                fecha_inicio_curso: params.fecha_inicio_curso_params,
                [fieldName]: value
            }, { transaction });
        }
    }
};

export const putInstancia = async (req, res, next) => {
    const usuario = req.user.user;
    const t = await sequelize.transaction();

    try {
        logger.info('✏️ Iniciando actualización de instancia');

        const { curso_params, fecha_inicio_curso_params } = req.params;
        const where = buildUpdateQuery(req.body);

        logger.info(`📝 Usuario: ${usuario.cuil} - Curso: ${curso_params} - Fecha: ${fecha_inicio_curso_params}`);

        await updateRestricciones(RestriccionesPorDepartamento, req.body, req.params, t, 'departamentos', req.body.departamentos, 'departamento_id');
        await updateRestricciones(RestriccionesPorCorrelatividad, req.body, req.params, t, 'cursos_correlativos', req.body.cursos_correlativos, 'curso_correlativo');

        const [updatedCount] = await instanciaModel.update(where, {
            where: {
                curso: curso_params,
                fecha_inicio_curso: fecha_inicio_curso_params
            },
            transaction: t
        });

        if (updatedCount > 0) {
            logger.info(`✅ Instancia actualizada exitosamente - Usuario: ${usuario.cuil} - Curso: ${curso_params} - Filas afectadas: ${updatedCount}`);
        } else {
            logger.warn(`⚠️ Actualización no afectó filas - Usuario: ${usuario.cuil} - Curso: ${curso_params} - Fecha: ${fecha_inicio_curso_params}`);
        }

        await t.commit();
        res.status(200).send({ affectedRows: updatedCount });

    } catch (error) {
        await t.rollback();
        logger.error(`❌ Error al actualizar instancia - Usuario: ${usuario?.cuil || 'N/A'} - Curso: ${req.params.curso_params} - Error: ${error.message}`, {
            stack: error.stack,
            usuario: usuario?.cuil,
            curso: req.params.curso_params
        });
        next(new AppError("Error al actualizar la instancia", 500));
    }
};


const tratar_restriccion_por_edad = (restriccion_edad_desde, restriccion_edad_hasta) => {
    if (restriccion_edad_desde > 16 || (restriccion_edad_hasta > 16)) return 1
    return 0
}
