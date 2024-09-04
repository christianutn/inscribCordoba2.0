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
import { getMatrizFechas } from "../googleSheets/services/getMatrizFechas.js";


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
    const t = await sequelize.transaction(); // Inicia una transacción

    try {
        const { ministerio, area, medio_inscripcion, plataforma_dictado, tipo_capacitacion, cupo, horas, curso, cohortes, tutores } = req.body;
        const aplicaRestricciones = req.user.user.esExcepcionParaFechas == 0;

        // Obtener matriz de fechas para verificar las reglas de negocio
        const matrizFechas = await getMatrizFechas(aplicaRestricciones);

        // Obtener el curso basado en el nombre proporcionado
        const dataCurso = await Curso.findOne({ where: { nombre: curso } });

        if (!dataCurso) {
            throw crearError(404, "No existe el curso");
        }

        // Procesar cada cohorte
        for (const cohorte of cohortes) {
            const { fechaInscripcionDesde, fechaInscripcionHasta, fechaCursadaDesde, fechaCursadaHasta, estado = "PEND" } = cohorte;

            // Validar el formato de las fechas
            if (![fechaInscripcionDesde, fechaInscripcionHasta, fechaCursadaDesde, fechaCursadaHasta].every(validarFormatoFecha)) {
                throw crearError(400, "Formato de fecha inválido");
            }

            // Verificar si la instancia ya existe en la BD
            const instanciaExistenteBD = await instanciaModel.findOne({
                where: {
                    curso: dataCurso.cod,
                    fecha_inicio_curso: fechaCursadaDesde,
                }
            });

            if (instanciaExistenteBD) {
                throw crearError(400, `La instancia para el curso ${curso} con fecha de inicio ${fechaCursadaDesde} ya existe en nuestra base de datos`);
            }

            // Verificar si la fecha de inicio del curso cumple con las reglas de restricciones
            const [year, month, day] = fechaCursadaDesde.split("-").map(Number);
            const mes = month - 1;
            const dia = day - 1;

            if (!matrizFechas[mes][dia]?.esPosible) {
                throw crearError(400, "La fecha no es posible");
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

            // Procesar cada tutor asociado a la instancia
            for (const tutor of tutores) {
                const existeTutor = await Persona.findOne({ where: { cuil: tutor.cuil } });

                if (!existeTutor) {
                    throw crearError(404, "El tutor no existe");
                }

                // Crear la relación de tutor e instancia
                await TutoresXInstancia.create({
                    cuil: tutor.cuil,
                    curso: dataCurso.cod,
                    fecha_inicio_curso: fechaCursadaDesde
                }, { transaction: t });
            }
        }

        // Agregar filas en Google Sheets
        agregarFilasGoogleSheets({ ...req.body, codCurso: dataCurso.cod });

        // Confirmar transacción
        await t.commit();
        res.status(201).json({ message: "Instancias y tutores creados exitosamente" });

    } catch (error) {
        // Revertir transacción en caso de error
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
