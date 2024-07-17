import usuarioModel from "../models/usuario.models.js";
import Persona from "../models/persona.models.js";
import Rol from "../models/rol.models.js";
import Area from "../models/area.models.js";
export const getUsuario = async (req, res, next) => {
    try {
        const usuarios = await usuarioModel.findAll({
            include: [
                {
                    model: Persona, as: 'detalle_persona'
                },
                {
                    model: Rol, as: 'detalle_rol'
                },
                {
                    model: Area, as: 'detalle_area'
                }
            ]
        });

        if(usuarios.length === 0){
            
            const error = new Error("No existen usuarios");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(usuarios)
    } catch (error) {
        next(error)
    }
}

export const postUsuario = async (req, res, next) => {
    res.status(200).json(req.user);
}