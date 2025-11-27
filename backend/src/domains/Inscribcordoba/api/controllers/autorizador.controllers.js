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

        const dataPersona = {}

        dataPersona.cuil = cuil;
        dataPersona.nombre = nombre;
        dataPersona.apellido = apellido;
        if (mail) dataPersona.mail = mail;
        if (celular) dataPersona.celular = celular;

        // buscamos si existe la persona
        const persona = await Persona.findOne({ where: { cuil } });

        if (persona) {
            // actualizamos la persona
            await persona.update(dataPersona);
        } else {
            // creamos la persona
            await Persona.create(dataPersona);
        }

        // fecha actual
        const fechaActual = DateTime.now().toFormat('yyyy-MM-dd')

        const nuevoAutorizador = await autorizadorModel.create({
            cuil: cuil,
            area: area,
            descripcion_cargo: descripcion_cargo,
            fecha_desde: fechaActual
        })

        res.status(201).json(nuevoAutorizador);

    } catch (error) {
        next(error);
    }
}