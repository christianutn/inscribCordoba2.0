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
}