import areaModel from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js"; // Importa el modelo de Ministerio
import Curso from "../models/curso.models.js";

export const getAreas = async (req, res, next) => {
    try {
       
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

    try {
        const { cod, nombre, ministerio, newCod, esVigente } = req.body;

        const area = await areaModel.update(
            { cod: newCod || cod, nombre, ministerio: ministerio, esVigente: esVigente },
            { where: { cod }}
        );

        if (area == 0) {
            throw new Error("No hubo cambios para actualizar.");
        }
        res.status(200).json({ success: true, message: "Área actualizada correctamente.", area });
    } catch (error) {
        next(error);
    }
};



export const postArea = async (req, res, next) => {
    try {

        let { cod, nombre, ministerio } = req.body;

        
        const area = await areaModel.create({ cod, nombre, ministerio, esVigente: true });
        res.status(201).json(area);

    } catch (error) {
        next(error);
    }
}
export const deleteArea = async (req, res, next) => {
    try {
        const { cod } = req.params;

        const deletedCount = await areaModel.destroy({ where: { cod } });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Área no encontrada." });
        }

        res.status(200).json({ message: "Área eliminada correctamente." });
    } catch (error) {
        next(error);
    }
}