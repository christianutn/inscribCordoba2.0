import Area from "../models/area.models.js";
import Persona from "../models/persona.models.js";
import Tutor from "../models/tutor.models.js";
import sequelize from "../config/database.js";
import validarCuil from "../utils/validarCuil.js"
import validarEmail from "../utils/validarMail.js";
import tratarNombres from "../utils/tratarNombres.js";

import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import Usuario from "../models/usuario.models.js";
import { Op } from 'sequelize'; // Importar el operador de Sequelize


export const getTutores = async (req, res, next) => {

    const { rol, area, cuil } = req.user.user

    // validar que no sean inválidos rol o cuil
    if (!cuil || !rol) {
        const error = new Error("No se encontraron los datos del usuario (rol o cuil)");
        error.statusCode = 404;
        throw error;
    }


    let tutores = [];
    try {
        if (rol === "ADM") {
            tutores = await Tutor.findAll({
                include: [
                    {
                        model: Persona, as: 'detalle_persona'
                    },
                    {
                        model: Area, as: 'detalle_area'
                    }
                ]
            });
        } else {

            //validamos si area es vacio debemos devolver error
            if (!area) {
                const error = new Error("No se encontraron los datos del area");
                error.statusCode = 404;
                throw error;
            }

            // Obtenemos las AreasAsignadasUsuario por cuil
            const areasAsignadas = await AreasAsignadasUsuario.findAll({
                where: { usuario: cuil },
                include: [
                    {
                        model: Usuario,
                        as: 'detalle_usuario'
                    },
                    {
                        model: Area,
                        as: 'detalle_area'
                    }
                ]
            });

            // creamos una nueva lista el primer elemento es el valor de area, los elementos restantes son los de areasAsignadas
            const codigosArea = [area, ...areasAsignadas.map(a => a.area)];

            // Buscamos los tutores cuya area estén incluido en codigosArea
            tutores = await Tutor.findAll({
                where: {
                    area: {
                        [Op.in]: codigosArea
                    }
                },
                include: [
                    {
                        model: Persona, as: 'detalle_persona'
                    },
                    {
                        model: Area, as: 'detalle_area'
                    }
                ]
            });

            
        }
        if (tutores.length === 0) {
            const error = new Error("No existen tutores");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(tutores)
    } catch (error) {
        next(error)
    }
};


export const putTutores = async (req, res, next) => {
    const t = await sequelize.transaction(); // Iniciamos la transacción
    try {


        let { cuil, nombre, apellido, mail, celular, newCuil, area, esReferente } = req.body;

        // Normalizar valores de entrada
        if (celular === "Sin celular" || celular === "") {
            celular = null;
        }

        if (!cuil || cuil.length !== 11 || !nombre || !apellido || !mail) {
            const error = new Error("Datos inválidos: no cumplen con los requisitos");
            error.statusCode = 400;
            throw error;
        }

        if (!validarCuil(cuil)) {
            const error = new Error("El CUIL no es válido");
            error.statusCode = 400;
            throw error;
        }

        if (!validarEmail(mail)) {
            const error = new Error("El mail no es válido");
            error.statusCode = 400;
            throw error;
        }

        esReferente = esReferente === "Si" ? 1 : esReferente === "No" ? 0 : null;

        // Limpieza de datos
        cuil = cuil.trim();
        newCuil = newCuil ? newCuil.trim() : null;
        nombre = tratarNombres(nombre.trim());
        apellido = tratarNombres(apellido.trim());
        mail = mail.trim();
        area = area.trim();
        celular = celular ? celular.trim() : null;

        // Actualización de Persona
        const updatePersona = await Persona.update(
            { nombre, apellido, mail, celular, cuil: newCuil || cuil },
            { where: { cuil: cuil }, transaction: t } // Aseguramos que se incluya la transacción
        );

        // Actualización de Tutor
        const updateTutor = await Tutor.update(
            { area, esReferente },
            { where: { cuil: cuil }, transaction: t } // Aseguramos que se incluya la transacción
        );

        if (updatePersona[0] === 0 && updateTutor[0] === 0) {
            const error = new Error("No se encontraron datos para actualizar");
            error.statusCode = 404;
            throw error;
        }

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

    try {

        let { cuil, area, esReferente } = req.body;



        if (!cuil) {
            const error = new Error("EL cuil es requerido");
            error.statusCode = 400;
            throw error;
        } else if (cuil.length !== 11) {
            const error = new Error("El CUIL debe ser de 11 caracteres sin guíones");
            error.statusCode = 400;
            throw error;
        }

        if (!area) {
            const error = new Error("EL área es requerida");
            error.statusCode = 400;
            throw error;
        }

        if (!esReferente) {
            const error = new Error("El referente es requerido");
            error.statusCode = 400;
            throw error;
        } else if (esReferente !== "Si" && esReferente !== "No") {
            const error = new Error("El referente debe ser Si o No");
            error.statusCode = 400;
            throw error;
        }
        // Limpieza de datos
        cuil = cuil.trim();
        area = area.trim();
        esReferente = esReferente.trim();

        if (!validarCuil(cuil)) {
            const error = new Error("El CUIL no es válido");
            error.statusCode = 400;
            throw error;
        }



        esReferente = esReferente === "Si" ? 1 : esReferente === "No" ? 0 : null;

        //Verificamos si la persona no existe
        const persona = await Persona.findOne({ where: { cuil: cuil } });
        if (!persona) {
            const error = new Error(`La persona con el cuil ${cuil} no existe. Debe crear primero a la persona`);
            error.statusCode = 404;
            throw error;
        }

        //Verificamos si el tutor ya existe
        const tutor = await Tutor.findOne({ where: { cuil: cuil } });
        if (tutor) {
            const error = new Error(`El tutor con el cuil ${cuil} ya existe`);
            error.statusCode = 404;
            throw error;
        }

        // Actualización de Tutor
        const altaTutor = await Tutor.create(
            { cuil: cuil, area: area, esReferente: esReferente }
        );

        if (!altaTutor) {
            const error = new Error("No se encontraron datos para actualizar");
            error.statusCode = 404;
            throw error;
        }
        res.status(201).json({ message: "Tutor creado correctamente" });

    } catch (error) {

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