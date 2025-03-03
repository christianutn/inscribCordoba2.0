import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import Usuario from "../models/usuario.models.js";
import Area from "../models/area.models.js";
import sequelize from "../config/database.js";

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
            const error = new Error("No existen áreas asignadas");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(areasAsignadas);
    } catch (error) {
        next(error);
    }
};

// Crear una nueva asignación
export const postAreaAsignada = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { cuil_usuario, cod_area, comentario } = req.body; 

        // Validaciones iniciales
        if (!cuil_usuario || !cod_area) {
            const error = new Error("El usuario y el area son obligatorios");
            error.statusCode = 400;
            throw error;
        }

        // Verificar si el usuario existe (esto se hace una vez fuera del loop)
        const existeUsuario = await Usuario.findOne({ where: { cuil: cuil_usuario } });
        if (!existeUsuario) {
            const error = new Error("El usuario no existe");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si el area existe (esto se hace una vez fuera del loop)
        const existeArea = await Area.findOne({ where: { cod: cod_area } });
        if (!existeArea) {
            const error = new Error("El area no existe");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si el usuario y el area ya estan asignados
        const asignacionesExistentes = await AreasAsignadasUsuario.findAll({
            where: { usuario: cuil_usuario, area: cod_area },
            transaction: t
        });

        if (asignacionesExistentes.length > 0) {
            const error = new Error("El usuario y el area ya estan asignados");
            error.statusCode = 400;
            throw error;
        }

        // crear nueva asignacion de area
        const nuevaAsignacion = await AreasAsignadasUsuario.create(
            { usuario: cuil_usuario.trim(), area: cod_area.trim(), comentario: comentario || "Sin comentarios" },
            { transaction: t }
        )

        if (!nuevaAsignacion) {
            const error = new Error("No se pudo crear la nueva asignación");
            error.statusCode = 400;
            throw error;
        }


        await t.commit();
        res.status(201).json(nuevaAsignacion); // Devolver la lista de asignaciones creadas
    } catch (error) {
        await t.rollback();
        next(error);
    }
};
// Actualizar una asignación existente
export const putAreaAsignada = async (req, res, next) => {
    const t = await sequelize.transaction();
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
                where: { usuario: cuil_usuario, area: cod_area },
                transaction: t
            }
        );

        if (asignacionActualizada[0] === 0) {
            const error = new Error("No se pudo actualizar la asignación");
            error.statusCode = 400;
            throw error;
        }

        await t.commit();
        res.status(200).json({ message: "Asignación actualizada correctamente" });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// Eliminar una asignación
export const deleteAreaAsignada = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { usuario, area } = req.params;

        if (!usuario || !area) {
            const error = new Error("El usuario y el área son obligatorios");
            error.statusCode = 400;
            throw error;
        }

        const resultado = await AreasAsignadasUsuario.destroy({
            where: { usuario: usuario, area: area },
            transaction: t
        });

        if (resultado === 0) {
            const error = new Error("No se encontró la asignación para eliminar");
            error.statusCode = 404;
            throw error;
        }

        await t.commit();
        res.status(200).json({ message: "Asignación eliminada correctamente" });
    } catch (error) {
        await t.rollback();
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