import DatosDesarrollo from "../models/datos_desarrollo.models.js";
import Usuario from "../models/usuario.models.js";
import AppError from "../../../../utils/appError.js";

// GET - Obtener todos los registros de datos de desarrollo
export const getDatosDesarrollo = async (req, res, next) => {
    try {
        const registros = await DatosDesarrollo.findAll({
            include: [{ model: Usuario, as: 'detalle_usuario' }],
            order: [['anio', 'DESC'], ['mes', 'DESC']]
        });

        res.status(200).json(registros);
    } catch (error) {
        next(error);
    }
};

// GET - Obtener registros de datos de desarrollo por CUIL
export const getDatosDesarrolloByCuil = async (req, res, next) => {
    try {
        const { cuil } = req.params;

        const registros = await DatosDesarrollo.findAll({
            where: { cuil },
            order: [['anio', 'DESC'], ['mes', 'DESC']]
        });

        if (registros.length === 0) {
            throw new AppError("No se encontraron registros de datos de desarrollo para este usuario", 404);
        }

        res.status(200).json(registros);
    } catch (error) {
        next(error);
    }
};

// GET - Obtener un registro de datos de desarrollo por ID
export const getDatosDesarrolloById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const registro = await DatosDesarrollo.findByPk(id, {
            include: [{ model: Usuario, as: 'detalle_usuario' }]
        });

        if (!registro) {
            throw new AppError("No se encontró el registro de datos de desarrollo", 404);
        }

        res.status(200).json(registro);
    } catch (error) {
        next(error);
    }
};

// POST - Crear un nuevo registro de datos de desarrollo
export const postDatosDesarrollo = async (req, res, next) => {
    try {
        const { mes, anio, cuil, lineas_cod_modificadas, lineas_cod_eliminadas, observaciones } = req.body;

        if (!mes || !anio || !cuil) {
            throw new AppError("Los campos mes, anio y cuil son obligatorios", 400);
        }

        const usuario = await Usuario.findByPk(cuil);
        if (!usuario) {
            throw new AppError("El usuario con el CUIL indicado no existe", 404);
        }

        const nuevoRegistro = await DatosDesarrollo.create({
            mes,
            anio,
            cuil,
            lineas_cod_modificadas: lineas_cod_modificadas ?? null,
            lineas_cod_eliminadas: lineas_cod_eliminadas ?? null,
            observaciones: observaciones ?? null
        });

        res.status(201).json(nuevoRegistro);
    } catch (error) {
        next(error);
    }
};

// PUT - Actualizar un registro de datos de desarrollo
export const putDatosDesarrollo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mes, anio, cuil, lineas_cod_modificadas, lineas_cod_eliminadas, observaciones } = req.body;

        const registro = await DatosDesarrollo.findByPk(id);
        if (!registro) {
            throw new AppError("No se encontró el registro de datos de desarrollo a actualizar", 404);
        }

        const [filasActualizadas] = await DatosDesarrollo.update(
            { mes, anio, cuil, lineas_cod_modificadas, lineas_cod_eliminadas, observaciones },
            { where: { id } }
        );

        if (filasActualizadas === 0) {
            throw new AppError("No se pudo actualizar el registro", 400);
        }

        res.status(200).json({ message: "Registro de datos de desarrollo actualizado correctamente" });
    } catch (error) {
        next(error);
    }
};

// DELETE - Eliminar un registro de datos de desarrollo
export const deleteDatosDesarrollo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const registro = await DatosDesarrollo.findByPk(id);
        if (!registro) {
            throw new AppError("No se encontró el registro de datos de desarrollo a eliminar", 404);
        }

        await DatosDesarrollo.destroy({ where: { id } });

        res.status(200).json({ message: "Registro de datos de desarrollo eliminado correctamente" });
    } catch (error) {
        next(error);
    }
};
