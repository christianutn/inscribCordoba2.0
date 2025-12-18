import autorizadorModel from "../models/autorizador.models.js";
import Persona from "../models/persona.models.js";
import Area from "../models/area.models.js";
import { Op } from 'sequelize';
// importamos luxon
import { DateTime } from 'luxon';

export const getAutorizadores = async (req, res, next) => {
    try {
        // 1. Capturamos los parámetros. 
        // Como dices que no puedes diferenciar el input, asumimos que el valor 
        // a buscar puede venir en cualquiera de estos campos o quieres unificarlo.
        const { nombre, apellido, cuil, busqueda } = req.query;

        // Definimos el término común. Si mandan ?nombre=Juan&apellido=Juan, tomamos "Juan".
        // Priorizamos 'busqueda' si existiera, sino 'nombre', etc.
        const terminoBusqueda = busqueda || nombre || apellido || cuil;

        // 2. Preparamos el filtro para la tabla PERSONA
        const filtroPersona = {};

        // Variable para controlar si forzamos el INNER JOIN
        let hayFiltros = false;

        if (terminoBusqueda) {
            hayFiltros = true;

            // AQUI ESTÁ LA MAGIA: Op.or (La Unión)
            // Le decimos a la BD: "Traeme el registro si coincide el nombre O el apellido O el cuil"
            filtroPersona[Op.or] = [
                { nombre: { [Op.like]: `%${terminoBusqueda}%` } },
                { apellido: { [Op.like]: `%${terminoBusqueda}%` } },
                { cuil: { [Op.like]: `%${terminoBusqueda}%` } }
            ];
        }

        const autorizadores = await autorizadorModel.findAll({
            include: [
                {
                    model: Persona,
                    as: 'detalle_persona',
                    // Aplicamos el filtro OR aquí
                    where: filtroPersona,
                    // Si hay término de búsqueda, forzamos que traiga solo las coincidencias (INNER JOIN)
                    required: hayFiltros
                },
                {
                    model: Area,
                    as: 'detalle_area'
                }
            ]
        });

        if (autorizadores.length === 0) {
            const mensaje = hayFiltros
                ? `No se encontraron coincidencias para: '${terminoBusqueda}'`
                : "No existen autorizadores registrados.";

            const error = new Error(mensaje);
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(autorizadores);

    } catch (error) {
        next(error);
    }
}


export const postAutorizador = async (req, res, next) => {
    try {
        const { cuil, nombre, apellido, mail, celular, area, descripcion_cargo } = req.body;

        // 1. Validaciones básicas de campos obligatorios según tu SQL (NOT NULL)
        if (!area || !descripcion_cargo) {
            return res.status(400).json({
                message: "Los campos area y descripcion_cargo son obligatorios."
            });
        }

        // 2. Obtener fecha actual en formato yyyy-MM-dd
        const fechaActual = DateTime.now().toISODate();

        // 3. Manejo de duplicados (Opcional pero recomendado)
        // Podrías verificar si ya existe antes de crear, o dejar que el catch capture el error de la DB

        const nuevoAutorizador = await autorizadorModel.create({
            cuil,
            area,
            descripcion_cargo,
            fecha_desde: fechaActual,
            nombre: nombre || null,    // Permite que sean null si no vienen
            apellido: apellido || null,
            mail: mail || null,
            celular: celular || null
        });

        return res.status(201).json(nuevoAutorizador);

    } catch (error) {
        // 4. Manejo específico para la restricción UNIQUE de tu tabla
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: "Ya existe un registro para este CUIL en esta área con la fecha de hoy."
            });
        }

        // Otros errores (ej. error de clave foránea si el 'area' no existe)
        next(error);
    }
}