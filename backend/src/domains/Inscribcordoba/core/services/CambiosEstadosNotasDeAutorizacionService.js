
export default class CambiosEstadoNotaDeAutorizacionService {

    constructor({ repositorioCambioEstadoNotaDeAutorizacion }) {
        this.cambiosEstadoNotaDeAutorizacionRepository = repositorioCambioEstadoNotaDeAutorizacion;
    }

    async crearCambioEstadoNotaDeAutorizacion(data, options = {}) {
        // Validar que data no esté vacío
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Los datos del cambio de estado son requeridos');
        }

        const transaction = options.transaction;

        return await this.cambiosEstadoNotaDeAutorizacionRepository.crearCambioEstadoNotaDeAutorizacion(
            data,
            { ...options, transaction }
        );
    }

    async cerrarCambioEstadoNotaDeAutorizacion(id, data, options = {}) {
        return await this.cambiosEstadoNotaDeAutorizacionRepository.cerrarCambioEstadoNotaDeAutorizacion(id, data, options);
    }

}