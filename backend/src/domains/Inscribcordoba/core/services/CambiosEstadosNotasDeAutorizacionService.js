
export default class CambiosEstadoNotaDeAutorizacionService {

    constructor({ repositorioCambioEstadoNotaDeAutorizacion }) {
        this.cambiosEstadoNotaDeAutorizacionRepository = repositorioCambioEstadoNotaDeAutorizacion;
    }

    async crear(data, options = {}) {
        // Validar que data no esté vacío
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Los datos del cambio de estado son requeridos');
        }

        const transaction = options.transaction;

        return await this.cambiosEstadoNotaDeAutorizacionRepository.crear(
            data,
            { ...options, transaction }
        );
    }

    async autorizar(data, options = {}) {
        return await this.cambiosEstadoNotaDeAutorizacionRepository.autorizar(data, options);
    }

    async cerrarCambioEstadoNotaDeAutorizacion(id, data, options = {}) {
        return await this.cambiosEstadoNotaDeAutorizacionRepository.cerrarCambioEstadoNotaDeAutorizacion(id, data, options);
    }


    async getEstadoActualDeNotaDeAutorizacion(nota_autorizacion_id) {
        return await this.cambiosEstadoNotaDeAutorizacionRepository.getEstadoActualDeNotaDeAutorizacion(nota_autorizacion_id);
    }

    async getTodosLosCambiosEstados() {
        return await this.cambiosEstadoNotaDeAutorizacionRepository.getTodosLosCambiosEstados();
    }

    async rechazar(data, options = {}) {
        return await this.cambiosEstadoNotaDeAutorizacionRepository.rechazar(data, options);
    }

}