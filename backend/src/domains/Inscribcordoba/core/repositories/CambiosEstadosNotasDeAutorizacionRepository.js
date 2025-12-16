import Estados_notas_autorizacion from "../../api/models/estado_nota_autorizacion.models.js";
import NotasAutorizacion from "../../api/models/notas_autorizacion.models.js";
import Usuario from "../../api/models/usuario.models.js";
import Autorizador from "../../api/models/autorizador.models.js";
import Persona from "../../api/models/persona.models.js";
import Area from "../../api/models/area.models.js";
import Ministerio from "../../api/models/ministerio.models.js";
import CambioEstadosModel from "../../api/models/cambios_estados_notas_autorizacion.models.js"

export default class CambiosEstadoNotaDeAutorizacionRepository {

    constructor() {
        this.cambiosEstadoNotaDeAutorizacion = CambioEstadosModel;
    }

    async crear(data, options = {}) {

        // // Buscamos último estado de nota de autorizacion

        const ultimoCambioEstado = await this.getEstadoActualDeNotaDeAutorizacion(data.nota_autorizacion_id);

        if (ultimoCambioEstado) {
            await this.cerrarCambioEstadoNotaDeAutorizacion(ultimoCambioEstado.id, { fecha_hasta: data.fecha_desde }, { transaction: options.transaction })
        }

        return await this.cambiosEstadoNotaDeAutorizacion.create(data, options);

    }

    async getEstadoActualDeNotaDeAutorizacion(nota_autorizacion_id) {
        return await this.cambiosEstadoNotaDeAutorizacion.findOne({
            where: {
                nota_autorizacion_id: nota_autorizacion_id,
                fecha_hasta: null
            }
        });

    }

    async autorizar(data, options = {}) {

        // // Buscamos último estado de nota de autorizacion

        const ultimoCambioEstado = await this.getEstadoActualDeNotaDeAutorizacion(data.nota_autorizacion_id);

        if (ultimoCambioEstado) {
            await this.cerrarCambioEstadoNotaDeAutorizacion(ultimoCambioEstado.id, { fecha_hasta: data.fecha_desde }, { transaction: options.transaction })
        }

        return await this.cambiosEstadoNotaDeAutorizacion.create({
            ...data,
            estado_nota_autorizacion_cod: "AUT"
        }, options);

    }


    async getTodosLosCambiosEstados() {
        return await this.cambiosEstadoNotaDeAutorizacion.findAll({
            include: [
                {
                    model: Estados_notas_autorizacion,
                    as: 'Estado'
                },
                {
                    model: NotasAutorizacion,
                    as: 'NotaAutorizacion',
                    include: [
                        {
                            model: Usuario,
                            as: 'detalle_usuario',
                            include: [
                                { model: Persona, as: 'detalle_persona' },
                                { model: Area, as: 'detalle_area', include: [{ model: Ministerio, as: 'detalle_ministerio' }] }
                            ]
                        },
                        {
                            model: Autorizador,
                            as: 'detalle_autorizador',
                            include: [{ model: Persona, as: 'detalle_persona' }]
                        }
                    ]
                }
            ]
        });
    }


    async cerrarCambioEstadoNotaDeAutorizacion(id, data, options = {}) {
        const transaction = options.transaction;
        return await this.cambiosEstadoNotaDeAutorizacion.update(data, {
            where: {
                id: id
            },
            transaction
        });
    }

    async gestionarCierreUltimoEstado(nota_autorizacion_id, options = {}) {
        const transaction = options.transaction;
        const ultimoCambioEstado = await this.getEstadoActualDeNotaDeAutorizacion(nota_autorizacion_id);
        if (ultimoCambioEstado) {
            await this.cerrarCambioEstadoNotaDeAutorizacion(ultimoCambioEstado.id, { fecha_hasta: new Date() }, { transaction })
        }
    }


    async rechazar(data, options = {}) {
        try {
            return await this.crear({
                ...data,
                estado_nota_autorizacion_cod: "REC"
            }, options);
        } catch (error) {
            throw error;
        }
    }
}