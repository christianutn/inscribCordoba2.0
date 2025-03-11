import instanciaModel from "../models/instancia.models.js";
import Curso from "../models/curso.models.js";
import Estado from "../models/estado.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import validarFormatoFecha from "../utils/validarFormatoFecha.js";
import Persona from "../models/persona.models.js";
import sequelize from "../config/database.js";
import TutoresXInstancia from "../models/tutorXInstancia.models.js";
import { agregarFilasGoogleSheets } from "../googleSheets/services/agregarFilasGoogleSheets.js";
import { esInstanciaExistente } from "../googleSheets/services/esInstanciaExistente.js";

import { getObjFechas } from "../googleSheets/services/getObjFechas.js";
import {superaAcumulado} from "../googleSheets/services/superaAcumulado.js";

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
                    model: Estado, as: 'detalle_estado'

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
        const { ministerio, area, medio_inscripcion, plataforma_dictado, tipo_capacitacion, cupo, horas, curso, cohortes, tutores, opciones, comentario } = req.body;
        const aplicaRestricciones = req.user.user.esExcepcionParaFechas == 0;

        // variable que guarda fecha y hora exacta en horas y minutos nada mas en que se ejecuta
        const fechaActual = new Date();
        const fechaActualString = `${fechaActual.getFullYear()}-${fechaActual.getMonth() + 1}-${fechaActual.getDate()} ${fechaActual.getHours()}:${fechaActual.getMinutes()}`;

        // cuil del usaurio que hizo la solicitud
        const cuilUsuario = req.user.user.cuil;

        // cadena de fechaActualString y cuilUsuario
        const cadenaSolicitud = `${fechaActualString}-${cuilUsuario}`;
        
        // Obtener objeto de fechas para verificar las reglas de negocio
        const objFechas = await getObjFechas(aplicaRestricciones);

        const dataCurso = await Curso.findOne({ where: { nombre: curso } });
        if (!dataCurso) {
            throw crearError(404, "No existe el curso");
        }

        for (const cohorte of cohortes) {
            const { fechaInscripcionDesde, fechaInscripcionHasta, fechaCursadaDesde, fechaCursadaHasta, estado = "PEND" } = cohorte;

            if (![fechaInscripcionDesde, fechaInscripcionHasta, fechaCursadaDesde, fechaCursadaHasta].every(validarFormatoFecha)) {
                throw crearError(400, "Formato de fecha inválido");
            }

            const instanciaExistenteBD = await instanciaModel.findOne({
                where: {
                    curso: dataCurso.cod,
                    fecha_inicio_curso: fechaCursadaDesde,
                }
            });

            if (instanciaExistenteBD) {
                throw crearError(400, `La instancia para el curso ${curso} con fecha de inicio ${fechaCursadaDesde} ya existe en nuestra base de datos`);
            }

            // Verificar restricciones de fecha usando el nuevo formato
            const claveMesAnio = `${fechaCursadaDesde.split('-')[0]}-${fechaCursadaDesde.split('-')[1]}`;
            const fechaClave = fechaCursadaDesde;

            // Verificar si el mes está invalidado
            if (objFechas[claveMesAnio]?.invalidarMesAnio) {
                throw crearError(400, "Se ha superado el límite mensual de cursos o cupos");
            }

            // Verificar si el día específico está invalidado
            if (objFechas[claveMesAnio]?.[fechaClave]?.invalidarDia) {
                throw crearError(400, "Se ha superado el límite diario de cursos o cupos");
            }

            // Verificar si el acumulado está invalidado
            if(aplicaRestricciones && await superaAcumulado(objFechas, fechaClave)){
                throw crearError(400, "Se ha superado el límite acumulado de cursos o cupos");
            }

            // Crear la instancia
            const instancia = await instanciaModel.create({
                curso: dataCurso.cod,
                fecha_inicio_inscripcion: fechaInscripcionDesde,
                fecha_fin_inscripcion: fechaInscripcionHasta,
                fecha_inicio_curso: fechaCursadaDesde,
                fecha_fin_curso: fechaCursadaHasta,
                estado: estado
            }, { transaction: t });

            // Procesar tutores
            for (const tutor of tutores) {
                const existeTutor = await Persona.findOne({ where: { cuil: tutor.cuil } });
                if (!existeTutor) {
                    throw crearError(404, "El tutor no existe");
                }

                await TutoresXInstancia.create({
                    cuil: tutor.cuil,
                    curso: dataCurso.cod,
                    fecha_inicio_curso: fechaCursadaDesde
                }, { transaction: t });
            }
        }

        

        agregarFilasGoogleSheets({ ...req.body, codCurso: dataCurso.cod, cadenaSolicitud: cadenaSolicitud });

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



