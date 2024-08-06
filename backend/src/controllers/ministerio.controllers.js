import Ministerio from "../models/ministerio.models.js";
import Area from "../models/area.models.js";
import Curso from "../models/curso.models.js";

export const getMinisterios = async (req, res, next) => {
    try {
        // Obtener los valores del token
        const { rol, area } = req.user.user;

        let ministerios;

        if (rol === "ADM") {
            ministerios = await Ministerio.findAll({
                include: [
                    {
                        model: Area,
                        as: 'detalle_areas',
                        include: [
                            {
                                model: Curso,
                                as: 'detalle_cursos'
                            }
                        ]
                    }
                ]
            });
        } else {
            ministerios = await Ministerio.findAll({
                include: [
                    {
                        model: Area,
                        as: 'detalle_areas',
                        where: { cod: area }, // Filtrar por área específica del usuario
                        include: [
                            {
                                model: Curso,
                                as: 'detalle_cursos'
                            }
                        ]
                    }
                ]
            });
        }

        if (ministerios.length === 0) {
            const error = new Error("No existen ministerios");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(ministerios);
    } catch (error) {
        next(error);
    }
};

export const getMinisterioByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const ministerio = await Ministerio.findOne({
            where: { cod: cod },
            include: [
                {
                    model: Area,
                    as: 'detalle_areas'
                }
            ]
        });

        if (!ministerio) {
            const error = new Error("No existe el ministerio");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(ministerio);
    } catch (error) {
        throw error;

    }
}
