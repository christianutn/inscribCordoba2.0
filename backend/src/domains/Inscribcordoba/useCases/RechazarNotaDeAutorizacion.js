import { DateTime } from "luxon";
import sequelize from "../../../config/database.js";

export default class RechazarNotaDeAutorizacion {
    constructor({ repositorioCambioEstadoNotaDeAutorizacion }) {
        this.cambiosEstadoNotaDeAutorizacion = repositorioCambioEstadoNotaDeAutorizacion;
    }

    async ejecutar(data, options = {}) {
        const fecha_desde = DateTime.now().setZone('America/Argentina/Buenos_Aires').toFormat('yyyy-MM-dd HH:mm:ss')

        return await this.cambiosEstadoNotaDeAutorizacion.rechazar({
            ...data,
            fecha_desde
        }, options);
    }
}