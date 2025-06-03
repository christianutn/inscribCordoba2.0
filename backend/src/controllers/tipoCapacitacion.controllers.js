import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import { actualizarDatosColumna } from "../googleSheets/services/actualizarDatosColumna.js";
import sequelize from "../config/database.js";
import parseEsVigente from "../utils/parseEsVigente.js"

export const getTiposCapacitacion = async (req, res, next) => {
    try {
        const tiposCapacitacion = await tipoCapacitacionModel.findAll();

        if (tiposCapacitacion.length === 0) {

            const error = new Error("No existen tipos de capacitacion");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(tiposCapacitacion)
    } catch (error) {
        next(error)
    }
}


export const putTiposCapacitacion = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {

        let { cod, nombre, newCod, esVigente } = req.body

        if (!cod) {

            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (!nombre) {

            const error = new Error("El nombre no es válido");
            error.statusCode = 400;
            throw error;
        }



        nombre = nombre.trim()
        cod = cod.trim()
        newCod = newCod ? newCod.trim() : null

        //Capturar el tipo de capacitacion para luego actualizar en el excel del cronograma
        const tipoCapacitacionAnterior = await tipoCapacitacionModel.findOne({ where: { cod } });

        if (!tipoCapacitacionAnterior) {

            const error = new Error("El tipo de capacitación no existe");
            error.statusCode = 404;
            throw error;
        }

        const tipoCapacitacionAnteriorJSON = JSON.parse(JSON.stringify(tipoCapacitacionAnterior));



        const tipo_capacitacion = await tipoCapacitacionModel.update({ cod: newCod || cod, nombre: nombre, esVigente: parseEsVigente(esVigente) }, {
            where: {
                cod: cod
            },
            transaction: t
        });

        if (tipo_capacitacion[0] === 0) {
            const error = new Error("No se pudo actualizar el tipo de capacitación");
            error.statusCode = 404;
            throw error;
        }

        // Llama a actualizarDatosColumna
        const resultadoGoogleSheets = await actualizarDatosColumna('Tipo de capacitación', tipoCapacitacionAnteriorJSON.nombre, nombre);

        if (!resultadoGoogleSheets.success) {
            throw new Error(`Error al actualizar en Google Sheets: ${resultadoGoogleSheets.error}`);
        }
        await t.commit();
        res.status(200).json(tipo_capacitacion);
    } catch (error) {
        await t.rollback();
        next(error);
    }
}


export const postTiposCapacitacion = async (req, res, next) => {

    try {
        let { cod, nombre } = req.body;
        if (!cod) {
            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }

        if (cod.length > 15) {
            const error = new Error("El código no puede ser mayor a 15 caracteres");
            error.statusCode = 400;
            throw error;
        }

        if (!nombre) {
            const error = new Error("El nombre no es valido");
            error.statusCode = 400;
            throw error;
        }
        nombre = nombre.trim()
        cod = cod.trim()

        const tipo_capacitacion = await tipoCapacitacionModel.create({ cod: cod, nombre: nombre });
        res.status(201).json(tipo_capacitacion);
    } catch (error) {
        next(error);
    }
}


export const deleteTiposCapacitacion = async (req, res, next) => {
    try {
        const { cod } = req.params;

        const tipo_capacitacion = await tipoCapacitacionModel.destroy({
            where: {
                cod: cod
            }
        });

        if (tipo_capacitacion === 0) {
            const error = new Error("No se pudo borrar el tipo de capacitación");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(tipo_capacitacion);
    } catch (error) {
        next(error);
    }
}