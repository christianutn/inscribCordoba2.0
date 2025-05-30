import areaModel from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js"; // Importa el modelo de Ministerio
import Curso from "../models/curso.models.js";
import { actualizarDatosColumna } from "../googleSheets/services/actualizarDatosColumna.js";
import sequelize from "../config/database.js";
import parseEsVigente from "../utils/parseEsVigente.js"

export const getAreas = async (req, res, next) => {
    try {
        const ministerioCod = req.query.ministerio // Obtén el código del ministerio de la query string

        const areas = await areaModel.findAll({
            include: [
                {
                    model: Ministerio, // Utiliza el modelo de Ministerio importado
                    as: 'detalle_ministerio',
                    attributes: ['cod', 'nombre'] // Puedes especificar qué atributos del ministerio quieres obtener
                },
                {
                    model: Curso,
                    as: 'detalle_cursos'

                }
            ]
        });

        if (areas.length === 0) {
            const error = new Error("No existen áreas");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(areas);
    } catch (error) {
        next(error);
    }
}



export const putArea = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { cod, nombre, ministerio, newCod, esVigente } = req.body;

        const esVigenteNormalizado = parseEsVigente(esVigente);

        if (!cod || !nombre || !ministerio) {
            throw new Error("Datos inválidos: se requiere código, nombre, ministerio y si es vigente.");
        }

        const areaActual = await areaModel.findOne({ where: { cod } });
        if (!areaActual) {
            throw new Error(`No se encontró un área con el código ${cod}`);
        }

        const areaActualJSON = areaActual.toJSON();

        const area = await areaModel.update(
            { cod: newCod || cod, nombre, ministerio: ministerio, esVigente: esVigenteNormalizado },
            { where: { cod }, transaction: t }
        );

        if (area == 0) {
            throw new Error("No hubo cambios para actualizar.");
        }

        // Llama a actualizarDatosColumna
        const resultadoGoogleSheets = await actualizarDatosColumna('Area', areaActualJSON.nombre, nombre);

        if (!resultadoGoogleSheets.success) {
            throw new Error(`Error al actualizar en Google Sheets: ${resultadoGoogleSheets.error}`);
        }

        await t.commit();
        res.status(200).json({ success: true, message: "Área actualizada correctamente.", area });
    } catch (error) {
        await t.rollback();
        console.error("Error en putArea:", error.message);
        next(error);
    }
};



export const postArea = async (req, res, next) => {
    try {

        let { cod, nombre, ministerio } = req.body;

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

        if (!ministerio) {

            const error = new Error("El ministerio no es válido");
            error.statusCode = 400;
            throw error;
        }

        nombre = nombre.trim()
        ministerio = ministerio.trim()
        cod = cod.trim()

        const existeArea = await areaModel.findOne({ where: { cod: cod } });
        if (existeArea) {
            const error = new Error(`El área con el código ${cod} ya existe`);
            error.statusCode = 400;
            throw error;
        }

        const existeMinisterio = await Ministerio.findOne({ where: { cod: ministerio } });
        if (!existeMinisterio) {
            const error = new Error(`El ministerio ${ministerio} no existe`);
            error.statusCode = 400;
            throw error;
        }
        const area = await areaModel.create({ cod: cod, nombre: nombre, ministerio: ministerio });
        res.status(201).json(area);

    } catch (error) {
        next(error);
    }
}

export const deleteArea = async (req, res, next) => {
    try {
        const { cod } = req.params

        if (cod == "" || cod == null || cod == undefined) {
            const error = new Error("El código no es válido");
            error.statusCode = 400;
            throw error;
        }

        const area = await areaModel.destroy({ where: { cod: cod } });

        if (area == 0) {
            const error = new Error(`El area ${cod} no existe`);
            error.statusCode = 400;
            throw error;
        }
        res.status(200).json(area);
    } catch (error) {
        next(error);
    }
}