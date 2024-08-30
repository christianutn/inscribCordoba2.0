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
    const t = await sequelize.transaction(); // Declaramos transacción
    try {
        const { ministerio, area, medio_inscripcion, plataforma_dictado, tipo_capacitacion, cupo, horas, curso, estado, cohortes, tutores } = req.body;

        //Buscamos matriz de fechas para verificar si una fecha cumple o no con las reglas de negocio
        const matrizFechas = await getMatrizFechas();

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

            // Verificamos si la instancia ya existe en la BD
            const instanciaExistenteBD = await instanciaModel.findOne({
                where: {
                    curso: dataCurso.cod,
                    fecha_inicio_curso
                }
            });
            if (instanciaExistenteBD) {
                const error = new Error(`La instancia para el curso ${curso} con fecha inicio de curso ${fecha_inicio_curso} ya existe en nuestra base de datos`);
                error.statusCode = 400;
                throw error;
            }

            //Verificamos si la fecha existe en el excel
            //Formato de fecha debe ser yyyy-mm-dd

            const instanciaExistente = await esInstanciaExistente(dataCurso.cod, fecha_inicio_curso);

            //Verificamos si la fecha_inicio_curso es posible y cumple con todas las reglas de restricciones

            //El formato de las fechas es yyyy-mm-dd

            let fechaArray = fecha_inicio_curso.split("-")
            
            let mes = parseInt(fechaArray[1], 10) -1;
            let dia = parseInt(fechaArray[2], 10) -1;

            if (!matrizFechas[mes][dia].esPosible) {
                const error = new Error("La fecha no es posible");
                error.statusCode = 400;
                throw error;
            }


            if (instanciaExistente) {
                const error = new Error(`La instancia para el curso ${curso} con fecha inicio de curso ${fecha_inicio_curso} ya existe en nuestro cronograma`);
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


            }
        }
        agregarFilasGoogleSheets({ ...req.body, codCurso: dataCurso.cod });
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
