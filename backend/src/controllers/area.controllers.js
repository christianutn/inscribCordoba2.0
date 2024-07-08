import areaModel from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js"; // Importa el modelo de Ministerio
import { Op } from "sequelize";

export const getAreas = async (req, res, next) => {
    try {
        const ministerioCod = req.query.ministerio // Obtén el código del ministerio de la query string

        const areas = await areaModel.findAll({
            include: [
                {
                    model: Ministerio, // Utiliza el modelo de Ministerio importado
                    as: 'detalle_ministerio',
                    attributes: ['cod', 'nombre'] // Puedes especificar qué atributos del ministerio quieres obtener
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


