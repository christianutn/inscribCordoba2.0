import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import Usuario from "../models/usuario.models.js";
import Area from "../models/area.models.js";
import AppError from "../../../../utils/appError.js";
import logger from '../../../../utils/logger.js';

// Obtener todas las asignaciones
export const getAreasAsignadas = async (req, res, next) => {
    try {
        const areasAsignadas = await AreasAsignadasUsuario.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'detalle_usuario'
                },
                {
                    model: Area,
                    as: 'detalle_area'
                }
            ]
        });

        if (areasAsignadas.length === 0) {
            throw new AppError("No se encontraron areas asignadas", 404)
        }

        res.status(200).json(areasAsignadas);
    } catch (error) {
        next(error);
    }
};

// Crear una nueva asignación
export const postAreaAsignada = async (req, res, next) => {
    
    try {
        const { cuil_usuario, cod_area, comentario } = req.body; 
        // crear nueva asignacion de area
        const nuevaAsignacion = await AreasAsignadasUsuario.create(
            { usuario: cuil_usuario.trim(), area: cod_area.trim(), comentario: comentario || "Sin comentarios" },
            
        )

        if (!nuevaAsignacion) {
            throw new AppError("No se pudo crear la nueva asignación", 400);
        }
        const usuario = req.user.user;
        logger.info(`Área asignada por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}: Usuario=${cuil_usuario}, Área=${cod_area}, Comentario="${comentario || 'Sin comentarios'}"`);
        res.status(201).json(nuevaAsignacion); // Devolver la lista de asignaciones creadas
    } catch (error) {
        next(error);
    }
};
// Actualizar una asignación existente
export const putAreaAsignada = async (req, res, next) => {
    try {
        const { cuil_usuario, cod_area, comentario } = req.body;

        if (!cuil_usuario || !cod_area) {
            const error = new Error("El usuario y el área son obligatorios");
            error.statusCode = 400;
            throw error;
        }

        const asignacion = await AreasAsignadasUsuario.findOne({
            where: { usuario: cuil_usuario, area: cod_area }
        });

        if (!asignacion) {
            const error = new Error("No se encontró la asignación");
            error.statusCode = 404;
            throw error;
        }

        const asignacionActualizada = await AreasAsignadasUsuario.update(
            { comentario },
            {
                where: { usuario: cuil_usuario, area: cod_area }
            }
        );

        if (asignacionActualizada[0] === 0) {
            const error = new Error("No se pudo actualizar la asignación");
            error.statusCode = 400;
            throw error;
        }
        const usuario = req.user.user;
        logger.info(`Área asignada actualizada por ${usuario?.nombre || 'N/A'} ${usuario?.apellido || 'N/A'}: Usuario=${cuil_usuario}, Área=${cod_area}, Nuevo Comentario="${comentario}"`);
        res.status(200).json({ message: "Asignación actualizada correctamente" });
    } catch (error) {
        next(error);
    }
};

// Eliminar una asignación
export const deleteAreaAsignada = async (req, res, next) => {
    try {
        const { usuario, area } = req.params;

        if (!usuario || !area) {
            const error = new Error("El usuario y el área son obligatorios");
            error.statusCode = 400;
            throw error;
        }

        const resultado = await AreasAsignadasUsuario.destroy({
            where: { usuario: usuario, area: area }
        });

        if (resultado === 0) {
            const error = new Error("No se encontró la asignación para eliminar");
            error.statusCode = 404;
            throw error;
        }
        const usuar = req.user.user;

        logger.warn(`Asignación eliminada por ${usuar?.nombre || 'N/A'} ${usuar?.apellido || 'N/A'}: Usuario=${usuario}, Área=${area}`);
        res.status(200).json({ message: "Asignación eliminada correctamente" });
    } catch (error) {
        next(error);
    }
};

// Obtener áreas asignadas por usuario
export const getAreasAsignadasPorUsuario = async (req, res, next) => {
    try {
        const { usuario } = req.params;

        const areasAsignadas = await AreasAsignadasUsuario.findAll({
            where: { usuario: usuario },
            include: [
                {
                    model: Area,
                    as: 'detalle_area'
                },
                {
                    model: Usuario,
                    as: 'detalle_usuario'
                }
            ]
        });

        if (areasAsignadas.length === 0) {
            const error = new Error("El usuario no tiene áreas asignadas");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(areasAsignadas);
    } catch (error) {
        next(error);
    }
}; 