import ministerioXAreaXCursoModel from "../models/ministerioXAreasXCurso.models.js";
import Area from "../models/area.models.js";
import Ministerio from "../models/ministerio.models.js";
import Curso from "../models/curso.models.js";


export const getMinisterioXAreaXCurso = async (req, res, next) => {
    try {
        const ministerioXAreaXCurso = await ministerioXAreaXCursoModel.findAll({
            include: [
                {
                    model: Ministerio, as: 'detalle_ministerio'
                },
                {
                    model: Area, as: 'detalle_area'
                },
                {
                    model: Curso, as: 'detalle_curso'
                }
            ]
        });
        if(ministerioXAreaXCurso.length === 0) {
            const error = new Error("No existen ministerioXAreaXCurso");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(ministerioXAreaXCurso);
    } catch (error) {
        next(error);
    }
}

