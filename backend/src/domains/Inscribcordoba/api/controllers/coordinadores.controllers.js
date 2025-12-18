import Coordinadores from '../models/coordinadores.models.js';
import AppError from '../../../../utils/appError.js';
import Persona from '../models/persona.models.js';
import NotaAutorizacion from '../models/notas_autorizacion.models.js';
import tratarNombres from '../../../../utils/tratarNombres.js';

// 1. IMPORTANTE: Importar Op para usar operadores lógicos (OR, LIKE)
import { Op } from 'sequelize';

export const getCoordinadores = async (req, res, next) => {
    try {
        const { busqueda } = req.query;

        // 2. Preparamos el filtro
        const filtroPersona = {};

        if (busqueda) {
            filtroPersona[Op.or] = [
                // Usamos LIKE para coincidencias parciales
                // Nota: Si usas PostgreSQL y quieres ignorar mayúsculas, usa Op.iLike
                { nombre: { [Op.like]: `%${busqueda}%` } },
                { apellido: { [Op.like]: `%${busqueda}%` } },
                { cuil: { [Op.like]: `%${busqueda}%` } }
            ];
        }

        const coordinadores = await Coordinadores.findAll({
            include: [
                {
                    model: Persona,
                    as: 'detalle_persona',
                    // 3. Aplicamos el filtro en la relación
                    where: filtroPersona,
                    // 4. Optimización:
                    // Si hay búsqueda, 'required: true' hace un INNER JOIN (solo trae coincidencias).
                    // Si no hay búsqueda, trae todo normalmente.
                    required: !!busqueda
                },
                {
                    model: NotaAutorizacion,
                    as: 'detalle_nota_autorizacion'
                }
            ]
        });

        res.status(200).json(coordinadores);

    } catch (error) {
        // Es buena práctica pasar el error original a la consola para depurar
        console.error(error);
        next(new AppError('Error al obtener los coordinadores', 500));
    }
};
export const getCoordinadorById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coordinador = await Coordinadores.findByPk(id);
        if (!coordinador) {
            return next(new AppError('No se encontró un coordinador con ese ID', 404));
        }
        res.status(200).json(coordinador);
    } catch (error) {
        next(new AppError('Error al obtener el coordinador', 500));
    }
};

export const postCoordinador = async (req, res, next) => {
    try {
        const { cuil, nombre, apellido, mail, celular } = req.body;

        const dataPersona = {}

        dataPersona.nombre = tratarNombres(nombre);
        dataPersona.apellido = tratarNombres(apellido);
        dataPersona.cuil = cuil;
        if (mail) dataPersona.mail = mail;
        if (celular) dataPersona.celular = celular;

        // Revisamos si la persona ya existe
        const persona = await Persona.findOne({ where: { cuil } });
        if (persona) {
            // actualizamos persona
            await persona.update(dataPersona);
        } else {
            // creamos persona
            await Persona.create(dataPersona);
        }

        const coordinador = await Coordinadores.create({
            cuil: cuil

        });

        return res.status(201).json(coordinador);

    } catch (error) {
        next(new AppError('Error al crear el coordinador', 500));
    }
};

export const updateCoordinador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cuil, nota_autorizacion_id } = req.body;
        const coordinador = await Coordinadores.findByPk(id);
        if (!coordinador) {
            return next(new AppError('No se encontró un coordinador con ese ID', 404));
        }
        await coordinador.update({
            cuil,
            nota_autorizacion_id
        });

        res.status(200).json(coordinador);
    } catch (error) {
        next(new AppError('Error al actualizar el coordinador', 500));
    }
};

export const deleteCoordinador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coordinador = await Coordinadores.findByPk(id);
        if (!coordinador) {
            return next(new AppError('No se encontró un coordinador con ese ID', 404));
        }
        await coordinador.destroy();
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(new AppError('Error al eliminar el coordinador', 500));
    }
};
