


export default class CambiosEstadoNotaDeAutorizacionRepository {

    constructor({modeloCambioEstadoNotaDeAutorizacion}) {
        this.cambiosEstadoNotaDeAutorizacion = modeloCambioEstadoNotaDeAutorizacion;

    }

    async crearCambioEstadoNotaDeAutorizacion(data, options = {}) {

        return await this.cambiosEstadoNotaDeAutorizacion.create(data, options);
        
    }

    async cerrarCambioEstadoNotaDeAutorizacion(id, fecha_hasta, transaction = null) {
        return await this.cambiosEstadoNotaDeAutorizacion.update({
            fecha_hasta: fecha_hasta
        }, {
            where: {
                id: id
            },
            transaction
        });
    }
}