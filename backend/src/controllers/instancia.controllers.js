import instanciaModel from "../models/instancia.models.js";
import Curso from "../models/curso.models.js";
import Estado from "../models/estado.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import validarFormatoFecha from "../utils/validarFormatoFecha.js";
import Persona from "../models/persona.models.js";
import sequelize from "../config/database.js";
import TutoresXInstancia from "../models/tutorXInstancia.models.js";


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
    const t = await sequelize.transaction(); // Declaramos transacción
    try {
        const { curso, estado, cohortes, tutores } = req.body;

        // Buscamos el curso una vez y reutilizamos el resultado
        const dataCurso = await Curso.findOne({
            where: {
                nombre: curso
            }
        });

        if (!dataCurso) {
            const error = new Error("No existe el curso");
            error.statusCode = 404;
            throw error;
        }

        // Procesamos cada cohorte
        for (let index = 0; index < cohortes.length; index++) {
            let c = cohortes[index];
            let fecha_inicio_inscripcion = c.fechaInscripcionDesde;
            let fecha_fin_inscripcion = c.fechaInscripcionHasta;
            let fecha_inicio_curso = c.fechaCursadaDesde;
            let fecha_fin_curso = c.fechaCursadaHasta;
            let estado = c.estado || "PEND";

            // Validación de formato de fecha
            if (!validarFormatoFecha(fecha_inicio_inscripcion) || !validarFormatoFecha(fecha_fin_inscripcion) || !validarFormatoFecha(fecha_inicio_curso) || !validarFormatoFecha(fecha_fin_curso)) {
                const error = new Error("Formato de fecha inválido");
                error.statusCode = 400;
                throw error;
            }

            // Verificamos si la instancia ya existe
            const instanciaExistente = await instanciaModel.findOne({
                where: {
                    curso: dataCurso.cod,
                    fecha_inicio_curso
                }
            });

            if (instanciaExistente) {
                const error = new Error(`La instancia para el curso ${curso} con fecha inicio de curso ${fecha_inicio_curso} ya existe`);
                error.statusCode = 400;
                throw error;
            }

            // Creamos la instancia
            const instancia = await instanciaModel.create({
                curso: dataCurso.cod,
                fecha_inicio_inscripcion: fecha_inicio_inscripcion,
                fecha_fin_inscripcion: fecha_fin_inscripcion,
                fecha_inicio_curso: fecha_inicio_curso,
                fecha_fin_curso: fecha_fin_curso,
                estado: estado
            }, { transaction: t });

            console.log("Instancia creada:", instancia);

            // Procesamos cada tutor asociado a la instancia
            for (let j = 0; j < tutores.length; j++) {
                let existeTutor = await Persona.findOne({
                    where: {
                        cuil: tutores[j].cuil
                    }
                });

                if (!existeTutor) {
                    const error = new Error("El tutor no existe");
                    error.statusCode = 404;
                    throw error;
                }

                // Creamos la relación de tutor e instancia
                let tutorXInstancia = await TutoresXInstancia.create({
                    cuil: tutores[j].cuil,
                    curso: dataCurso.cod,
                    fecha_inicio_curso
                }, { transaction: t });

                console.log("Tutor creado: ", tutorXInstancia);
            }
        }

        // Confirmamos transacción
        await t.commit();
        res.status(201).json({ message: "Instancias y tutores creados exitosamente" });
    } catch (error) {
        // Revertimos transacción
        await t.rollback();
        next(error);
    }
};



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
