import Area from "../models/area.models.js";
import Persona from "../models/persona.models.js";
import Tutor from "../models/tutor.models.js";
import sequelize from "../../../../config/database.js";
import validarCuil from "../../../../utils/validarCuil.js"
import validarEmail from "../../../../utils/validarMail.js";
import tratarNombres from "../../../../utils/tratarNombres.js";

import { Op } from 'sequelize'; // Importar el operador de Sequelize


export const getTutores = async (req, res, next) => {
    try {

        const usuario = req.user.user;
        // 1. Capturamos los parámetros. 
        // Como dices que no puedes diferenciar el input, asumimos que el valor 
        // a buscar puede venir en cualquiera de estos campos o quieres unificarlo.
        const { nombre, apellido, cuil, busqueda } = req.query;

        // Definimos el término común. Si mandan ?nombre=Juan&apellido=Juan, tomamos "Juan".
        // Priorizamos 'busqueda' si existiera, sino 'nombre', etc.
        const terminoBusqueda = busqueda || nombre || apellido || cuil;

        // 2. Preparamos el filtro para la tabla PERSONA
        const filtroPersona = {};

        // Variable para controlar si forzamos el INNER JOIN
        let hayFiltros = false;

        if (terminoBusqueda) {
            hayFiltros = true;

            // AQUI ESTÁ LA MAGIA: Op.or (La Unión)
            // Le decimos a la BD: "Traeme el registro si coincide el nombre O el apellido O el cuil"
            filtroPersona[Op.or] = [
                { nombre: { [Op.like]: `%${terminoBusqueda}%` } },
                { apellido: { [Op.like]: `%${terminoBusqueda}%` } },
                { cuil: { [Op.like]: `%${terminoBusqueda}%` } }
            ];
        }

        const filtroArea = {}

        if (usuario?.rol === 'REF') {
            filtroArea.area = usuario.area;
        }

        const tutores = await Tutor.findAll({
            include: [
                {
                    model: Persona,
                    as: 'detalle_persona',
                    // Aplicamos el filtro OR aquí
                    where: filtroPersona,
                    // Si hay término de búsqueda, forzamos que traiga solo las coincidencias (INNER JOIN)
                    required: hayFiltros
                },
                {
                    model: Area,
                    as: 'detalle_area'
                }
            ],
            where: filtroArea
        });


        if (tutores.length === 0) {
            const mensaje = hayFiltros
                ? `No se encontraron coincidencias para: '${terminoBusqueda}'`
                : "No existen autorizadtutores  registrados.";

            const error = new Error(mensaje);
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(tutores);

    } catch (error) {
        next(error);
    }
}

export const putTutores = async (req, res, next) => {
    const t = await sequelize.transaction(); // Iniciamos la transacción
    try {


        let { cuil, nombre, apellido, mail, celular, area, esReferente } = req.body;

        const dataPersona = {
            cuil,
            nombre,
            apellido
        }

        if (mail) dataPersona.mail = mail;
        if (celular) dataPersona.celular = celular;

        // Actualización de Persona
        await Persona.update(
            dataPersona,
            { where: { cuil: cuil }, transaction: t } // Aseguramos que se incluya la transacción
        );

        const dataTutor = {
            area,
            esReferente
        }

        // Actualización de Tutor
        const updateTutor = await Tutor.update(
            dataTutor,
            { where: { cuil: cuil }, transaction: t } // Aseguramos que se incluya la transacción
        );
        // Confirmamos la transacción
        await t.commit();
        res.status(200).json({ message: "Tutor actualizado correctamente" });

    } catch (error) {
        // Revertimos la transacción en caso de error
        await t.rollback();
        next(error);
    }
};


export const postTutor = async (req, res, next) => {

    const t = await sequelize.transaction();
    try {


        let { cuil, area, esReferente, nombre, apellido, mail, celular } = req.body;

        // Sanatizamos los datos para personas
        const dataPersona = {}

        dataPersona.cuil = cuil;
        dataPersona.nombre = nombre;
        dataPersona.apellido = apellido;

        if (mail) dataPersona.mail = mail;
        if (celular) dataPersona.celular = celular;



        esReferente = esReferente === "Si" ? 1 : esReferente === "No" ? 0 : null;

        //Verificamos si la persona no existe
        const persona = await Persona.findOne({ where: { cuil: cuil } });

        if (!persona) {
            await Persona.create(dataPersona, { transaction: t });
        } else {
            await Persona.update(dataPersona, { where: { cuil: cuil }, transaction: t });
        }

        await Tutor.create(
            { cuil: cuil, area: area, esReferente: esReferente },
            { transaction: t }
        );


        await t.commit();

        res.status(201).json({ message: "Tutor creado correctamente" });

    } catch (error) {

        await t.rollback();
        next(error);
    }
}


export const deleteTutor = async (req, res, next) => {
    try {
        const { cuil } = req.params;

        if (!cuil) {
            const error = new Error("El CUIL no puede estar vacío");
            error.statusCode = 400;
            throw error;
        }

        const tutor = await Tutor.destroy({ where: { cuil: cuil } });

        if (tutor === 0) {
            const error = new Error("No se encontraron datos para borrar");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: "Tutor borrado correctamente" });


    } catch (error) {
        next(error);
    }
}