import medioInscripcionModel from "../models/medioInscripcion.models.js";

import sequelize from "../config/database.js";
import parseEsVigente from "../utils/parseEsVigente.js"


export const getMediosInscripcion = async (req, res, next) => {
    try {
        const mediosInscripcion = await medioInscripcionModel.findAll();

        if (mediosInscripcion.length === 0) {

            const error = new Error("No existen medios de inscripción");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(mediosInscripcion)
    } catch (error) {
        next(error)
    }
}


export const putMedioInscripcion = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {

        let { cod, nombre, newCod, esVigente } = req.body

        if (cod == "" || cod == null || cod == undefined) {

            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (nombre == "" || nombre == null || nombre == undefined) {

            const error = new Error("El nombre no es valido");
            error.statusCode = 400;
            throw error;
        }



        nombre = nombre.trim()
        cod = cod.trim()
        newCod = newCod ? newCod.trim() : null

        //Antes de actualizar el medio de inscripcion capturamos sus valores
        //para luego actualar en el excel del cronograma

        const medioInscAnterior = await medioInscripcionModel.findOne({ where: { cod } });
        if (!medioInscAnterior) {
            throw new Error(`No se encontró un área con el código ${cod}`);
        }

        const areaActualJSON = medioInscAnterior.toJSON();

        //Actualizamos medio de inscripción con transacción

        const medioInscripcion = await medioInscripcionModel.update({ cod: newCod || cod, nombre: nombre, esVigente: parseEsVigente(esVigente) }, {
            where: {
                cod: cod
            },
            transaction: t
        });

        if (medioInscripcion[0] === 0) {
            const error = new Error("No se pudo actualizar el medio de inscripción");
            error.statusCode = 404;
            throw error;
        }


        if (!resultadoGoogleSheets.success) {
            throw new Error(`Error al actualizar en Google Sheets: ${resultadoGoogleSheets.error}`);
        }

        await t.commit();
        res.status(200).json(medioInscripcion);
    } catch (error) {
        await t.rollback();
        next(error);
    }
}


export const postMedioInscripcion = async (req, res, next) => {
    try {
        let { cod, nombre } = req.body;
        if (!cod) {
            const error = new Error("El código no es válido");
            error.statusCode = 400;
            throw error;
        }

        if (!nombre) {
            const error = new Error("El nombre no es válido");
            error.statusCode = 400;
            throw error;
        }

        cod = cod.trim();
        nombre = nombre.trim();

        const existeMedioInscripcion = await medioInscripcionModel.findOne({ where: { cod } });
        if (existeMedioInscripcion) {
            const error = new Error("El medio de inscripción ya existe");
            error.statusCode = 409;
            throw error;
        }

        const existeNombre = await medioInscripcionModel.findOne({ where: { nombre } });
        if (existeNombre) {
            const error = new Error("El nombre ya existe");
            error.statusCode = 409;
            throw error;
        }
        const newMedioInscripcion = await medioInscripcionModel.create({ cod, nombre });

        res.status(201).json(newMedioInscripcion);

    } catch (error) {
        next(error);
    }
}


export const deleteMedioInscripcion = async (req, res, next) => {
    try {
        const { cod } = req.params
        if (!cod) {
            const error = new Error("El código no es válido");
            error.statusCode = 400;
            throw error;
        }

        const medioInscripcion = await medioInscripcionModel.destroy({ where: { cod } });

        if (medioInscripcion === 0) {
            const error = new Error("No se encontraron coincidencias para borrar");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(medioInscripcion);
    } catch (error) {
        next(error);
    }
}
