import plataformaDictadoModel from "../models/plataformaDictado.models.js";

import sequelize from "../config/database.js";
import parseEsVigente from "../utils/parseEsVigente.js"


export const getPlataformasDictado = async (req, res, next) => {
    try {
        const plataformasDictado = await plataformaDictadoModel.findAll();

        if (plataformasDictado.length === 0) {

            const error = new Error("No existen plataformas de dictado");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(plataformasDictado)
    } catch (error) {
        next(error)
    }
}



export const putPlataformaDictado = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {

        let { cod, nombre, newCod, esVigente } = req.body

        if (!cod || !nombre) {
            const error = new Error("El código, el nombre y la vigencia son obligatorios");
            error.statusCode = 400;
            throw error;
        }



        nombre = nombre.trim()
        cod = cod.trim()
        newCod = newCod ? newCod.trim() : null

        //Capturar la plataforma de dictado para luego actualizar en el excel del cronograma
        const plataformaDictadoAnterior = await plataformaDictadoModel.findOne({ where: { cod } });

        if (!plataformaDictadoAnterior) {
            throw new Error(`No se encontró un área con el código ${cod}`);
        }

        const plataformaDictadoAnteriorJSON = plataformaDictadoAnterior.toJSON();

        //Actualizar la plataforma de dictado

        const plataforma_dictado = await plataformaDictadoModel.update({ cod: newCod || cod, nombre: nombre, esVigente: parseEsVigente(esVigente) }, {
            where: {
                cod: cod
            },
            transaction: t
        });

        if (plataforma_dictado[0] === 0) {
            const error = new Error("No se pudo actualizar la plataforma de dictado");
            error.statusCode = 404;
            throw error;
        }


        await t.commit();
        res.status(200).json(plataforma_dictado);
    } catch (error) {
        await t.rollback();
        next(error);
    }
}


export const postPlataformaDictado = async (req, res, next) => {
    try {
        let { cod, nombre } = req.body

        if (!cod) {

            const error = new Error("El código no es valido");
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

        const existeCod = await plataformaDictadoModel.findOne({
            where: {
                cod: cod
            }
        });
        if (existeCod) {
            const error = new Error("El Código ya existe");
            error.statusCode = 400;
            throw error;
        }

        const existeNombre = await plataformaDictadoModel.findOne({
            where: {
                nombre: nombre
            }
        });
        if (existeNombre) {
            const error = new Error("El nombre ya existe");
            error.statusCode = 400;
            throw error;
        }


        const plataforma_dictado = await plataformaDictadoModel.create({ cod: cod, nombre: nombre });
        res.status(200).json(plataforma_dictado);
    } catch (error) {
        next(error);
    }
}


export const deletePlataformaDictado = async (req, res, next) => {
    try {

        const { cod } = req.params

        const plataformaDictado = await plataformaDictadoModel.destroy({
            where: {
                cod
            }
        });

        if (plataformaDictado === 0) {

            const error = new Error("No se encontraron datos para eliminar");
            error.statusCode = 404;
            throw error;
        }


        res.status(200).json({ message: "Plataforma de dictado eliminada" });



    } catch (error) {
        next(error);
    }
}


