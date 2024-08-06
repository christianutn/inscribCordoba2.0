import Area from "../models/area.models.js";
import Persona from "../models/persona.models.js";
import Tutor from "../models/tutor.models.js";


export const getTutores = async (req, res, next) => {

    const { rol, area } = req.user.user
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
            tutores = await Tutor.findAll({
                where: {
                    area: area
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


