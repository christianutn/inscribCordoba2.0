import DatosDesarrollo from "../models/datos_desarrollo.models.js";
import Usuario from "../models/usuario.models.js";
import Persona from "../models/persona.models.js";
import logger from '../../../../utils/logger.js';
import { Op } from 'sequelize';

export const getDatosDesarrollo = async (req, res, next) => {
    try {
        const { busqueda, mes, anio } = req.query;
        const filtro = {};

        if (mes) filtro.mes = mes;
        if (anio) filtro.anio = anio;
        if (busqueda) {
            filtro[Op.or] = [
                { cuil: { [Op.like]: `%${busqueda}%` } }
            ];
        }

        const datos = await DatosDesarrollo.findAll({
            where: filtro,
            include: [
                {
                    model: Usuario,
                    as: 'detalle_usuario',
                    attributes: ['cuil'],
                    include: [
                        {
                            model: Persona,
                            as: 'detalle_persona',
                            attributes: ['nombre', 'apellido']
                        }
                    ]
                }
            ],
            order: [['anio', 'DESC'], ['mes', 'DESC']]
        });

        res.status(200).json(datos);
    } catch (error) {
        logger.error(`Error en getDatosDesarrollo: ${error.message}`);
        next(error);
    }
};

export const postDatosDesarrollo = async (req, res, next) => {
    try {
        const { mes, anio, cuil, lineas_cod_modificadas, lineas_cod_eliminadas, observaciones } = req.body;
        const usuario = req.user.user;

        const nuevoRegistro = await DatosDesarrollo.create({
            mes,
            anio,
            cuil,
            lineas_cod_modificadas,
            lineas_cod_eliminadas,
            observaciones
        });

        logger.info(`Datos de desarrollo creados por ${usuario?.nombre}: CUIL=${cuil}, Mes=${mes}, Año=${anio}`);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        logger.error(`Error en postDatosDesarrollo: ${error.message}`);
        next(error);
    }
};

export const putDatosDesarrollo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mes, anio, cuil, lineas_cod_modificadas, lineas_cod_eliminadas, observaciones } = req.body;
        const usuario = req.user.user;

        const registro = await DatosDesarrollo.findByPk(id);
        if (!registro) {
            return res.status(404).json({ message: "Registro no encontrado" });
        }

        await registro.update({
            mes,
            anio,
            cuil,
            lineas_cod_modificadas,
            lineas_cod_eliminadas,
            observaciones
        });

        logger.info(`Datos de desarrollo actualizados por ${usuario?.nombre}: ID=${id}`);
        res.status(200).json(registro);
    } catch (error) {
        logger.error(`Error en putDatosDesarrollo: ${error.message}`);
        next(error);
    }
};

export const deleteDatosDesarrollo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuario = req.user.user;

        const deletedCount = await DatosDesarrollo.destroy({ where: { id } });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Registro no encontrado" });
        }

        logger.warn(`Datos de desarrollo eliminados por ${usuario?.nombre}: ID=${id}`);
        res.status(200).json({ message: "Registro eliminado correctamente" });
    } catch (error) {
        logger.error(`Error en deleteDatosDesarrollo: ${error.message}`);
        next(error);
    }
};
