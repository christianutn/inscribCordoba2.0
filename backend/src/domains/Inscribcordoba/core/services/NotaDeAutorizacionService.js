export default class NotaDeAutorizacionService {

    constructor({ notaDeAutorizacionRepository }) {
        this.notaDeAutorizacionRepository = notaDeAutorizacionRepository;
    }

    async getNotasDeAutorizacion() {
        return await this.notaDeAutorizacionRepository.getNotasDeAutorizacion();
    }

    async getNotaAutorizacionPorId(id) {
        return await this.notaDeAutorizacionRepository.getNotaAutorizacionPorId(id);
    }

    async crearNotaAutorizacion(usuario_cuil, fechaActual, transaction) {
        return await this.notaDeAutorizacionRepository.crearNotaAutorizacion(usuario_cuil, fechaActual, transaction);
    }

    async actualizar(id, data, transaction) {
        return await this.notaDeAutorizacionRepository.actualizar(id, data, transaction);
    }


}