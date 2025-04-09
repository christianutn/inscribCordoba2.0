import Evento from '../models/evento.models.js';
import Perfil from '../models/perfil.models.js';
import AreaTematica from '../models/areaTematica.models.js';
import TipoCertificacion from '../models/tipoCertificacion.models.js';
import {agregarFilasNuevoEvento} from '../googleSheets/services/agregarFilaAEvento.js';
import sequelize from "../config/database.js";
import Curso from '../models/curso.models.js';

export const getEventos = async (req, res, next) => {
    try {
        const eventos = await Evento.findAll({
            order: [
                ['curso', 'ASC']
            ],
            include: [
                {
                    model: Perfil,
                    as: 'detalle_perfil'
                },
                {
                    model: AreaTematica,
                    as: 'detalle_areaTematica'
                },
                {
                    model: TipoCertificacion,
                    as: 'detalle_tipoCertificacion'
                }
            ]
        });

        
        res.status(200).json(eventos);
    } catch (error) {
        next(error);
    }
}

export const getEventoByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const evento = await Evento.findOne({ where: { curso: cod } });
        res.status(200).json(evento);
    } catch (error) {
        next(error);
    }
}


export const postEvento = async (req, res, next) => {
    const t = await sequelize.transaction();

    // Datos del usuario
    const { cuil } = req.user.user;
    try {
        const { curso, perfil, area_tematica, tipo_certificacion, presentacion, objetivos, requisitos_aprobacion, ejes_tematicos, certifica_en_cc, disenio_a_cargo_cc } = req.body;

        // validar datos del body
        if (!curso) {
            const error = new Error("El curso es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!perfil) {
            const error = new Error("El perfil es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!area_tematica) {
            const error = new Error("El area tematica es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!tipo_certificacion) {
            const error = new Error("El tipo de certificacion es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        if (!presentacion) {
            const error = new Error("La presentacion es obligatoria");
            error.statusCode = 400;
            throw error;
        }
        if (!objetivos) {
            const error = new Error("Los objetivos son obligatorios");
            error.statusCode = 400;
            throw error;
        }
        if (!requisitos_aprobacion) {
            const error = new Error("Los requisitos de aprobacion son obligatorios");
            error.statusCode = 400;
            throw error;
        }
        if (!ejes_tematicos) {
            const error = new Error("Los ejes tematicos son obligatorios");
            error.statusCode = 400;
            throw error;
        }
        
        

        // obtener curso
        const cursoEvento = await Curso.findOne({ where: { cod: curso } });
        if (!cursoEvento) {
            const error = new Error("El curso no existe");
            error.statusCode = 400;
            throw error;
        }

        // si cursiEvento.tiene_evento_Creado es 1, entonces no se puede crear el evento
        if (cursoEvento.tiene_evento_creado === 1) {
            const error = new Error("El curso ya tiene un evento creado");
            error.statusCode = 400;
            throw error;
        }

        
        
        
        const existeEvento = await Evento.findOne({ where: { curso } });
        if (existeEvento) {
            const error = new Error("El evento ya existe");
            error.statusCode = 400;
            throw error;
        }
        const evento = await Evento.create({
            curso,
            perfil,
            area_tematica,
            tipo_certificacion,
            presentacion,
            objetivos,
            requisitos_aprobacion,
            ejes_tematicos,
            certifica_en_cc,
            disenio_a_cargo_cc
        }, { transaction: t });

        //  Modificar el atributo tiene_evento_Creado de cursoEvento a 1
        cursoEvento.tiene_evento_creado = 1;
        await cursoEvento.save({ transaction: t });

        

        // Cambiar el nombre de la variable para evitar conflictos
        const resultado = await agregarFilasNuevoEvento(evento, cuil);

        await t.commit();
        res.status(201).json(evento);
    } catch (error) {
        await t.rollback();
        next(error);
    }
};
