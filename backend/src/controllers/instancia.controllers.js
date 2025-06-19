import instanciaModel from "../models/instancia.models.js";
import Curso from "../models/curso.models.js";
import Estado_Instancia from "../models/estado_instancia.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import validarFormatoFecha from "../utils/validarFormatoFecha.js";
import Persona from "../models/persona.models.js";
import sequelize from "../config/database.js";
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
        const {fechaCursadaDesde} = req.params;
        const superaCupoMes = await instanciaModel.supera_cupo_mes(fechaCursadaDesde);
        res.status(200).json(superaCupoMes);

    } catch (error) {
        next(error);
    }
}

export const supera_cupo_dia = async (req, res, next) => {
    try {
        const {fechaCursadaDesde} = req.params;
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
        const {fechaCursadaDesde} = req.params;
        const superaCupoDia = await instanciaModel.supera_cantidad_cursos_mes(fechaCursadaDesde);
        res.status(200).json(superaCupoDia);
    } catch (error) {
        next(error);
    }
}


export const supera_cantidad_cursos_dia = async (req, res, next) => {
    try {
        const {fechaCursadaDesde} = req.params;
        const superaCupoDia = await instanciaModel.supera_cantidad_cursos_dia(fechaCursadaDesde);
        res.status(200).json(superaCupoDia);
    } catch (error) {
        next(error);
    }
}