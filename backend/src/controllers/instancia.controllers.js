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

const calcularFechasInvalidasDelMes = async (anio, mes) => {
  const invalidDatesSet = new Set();

  // Luxon months are 1-indexed, matching our 'mes' parameter.
  const startDate = DateTime.local(anio, mes, 1);
  const daysInMonth = startDate.daysInMonth;

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = DateTime.local(anio, mes, day);
    const currentDateString = currentDate.toISODate(); // Format: YYYY-MM-DD

    try {
      // Call the model's static methods.
      // These methods are expected to return true if the limit is exceeded, false otherwise.
      const checks = [
        instanciaModel.supera_cupo_dia(currentDateString),
        instanciaModel.supera_cantidad_cursos_acumulado(currentDateString),
        instanciaModel.supera_cantidad_cursos_dia(currentDateString),
        instanciaModel.supera_cupo_mes(currentDateString), // Assumes model method is designed for this daily iteration context
        instanciaModel.supera_cantidad_cursos_mes(currentDateString) // Same assumption
      ];

      const results = await Promise.all(checks);

      if (results.some(result => result === true)) {
        invalidDatesSet.add(currentDateString);
      }

    } catch (error) {
      // Log the error and potentially re-throw or handle it if a single day's check failure
      // shouldn't stop the whole process. For now, log and continue to check other days.
      console.error(`Error checking limits for date ${currentDateString}:`, error);
      // Decide if this date should be considered invalid due to check error, or skip.
      // For robustness, if a check fails, we might want to either mark the day as "uncertain" (not straightforward)
      // or let it pass and rely on logs. Let's assume for now we log and it doesn't become invalid due to check error.
    }
  }

  return Array.from(invalidDatesSet);
};

export const obtenerFechasInvalidasPorMes = async (req, res, next) => {
  try {
    const { anio: anioStr, mes: mesStr } = req.query;

    if (!anioStr || !mesStr) {
      const error = new Error("Año y mes son requeridos en los parámetros query.");
      error.statusCode = 400;
      throw error;
    }

    const anio = parseInt(anioStr, 10);
    const mes = parseInt(mesStr, 10);

    if (isNaN(anio) || isNaN(mes)) {
      const error = new Error("Año y mes deben ser valores numéricos.");
      error.statusCode = 400;
      throw error;
    }

    if (mes < 1 || mes > 12) {
      const error = new Error("Mes debe estar entre 1 y 12.");
      error.statusCode = 400;
      throw error;
    }

    // Example: Validate year range (e.g., between 2000 and 2030)
    // Adjust range as necessary for the application context.
    if (anio < 2000 || anio > 2030) {
      const error = new Error("Año fuera del rango permitido (2000-2030).");
      error.statusCode = 400;
      throw error;
    }

    // Call the (currently placeholder) logic function
    const fechasInvalidas = await calcularFechasInvalidasDelMes(anio, mes);

    res.status(200).json(fechasInvalidas);

  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};


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