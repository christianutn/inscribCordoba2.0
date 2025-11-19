import NotaDeAutorizacionRepository from "../repositories/NotaDeAutorizacionRepository.js"


export default class NotaDeAutorizacionService {

    constructor() {
        this.notaDeAutorizacionRepository = new NotaDeAutorizacionRepository();
    }

    async getNotasDeAutorizacion() {
        return await this.notaDeAutorizacionRepository.getNotasDeAutorizacion();
    }

    async crearNotaAutorizacion(usuario_cuil, fechaActual, transaction) {
        return await this.notaDeAutorizacionRepository.crearNotaAutorizacion(usuario_cuil, fechaActual, transaction);
    }

    async actualizarNotaAutorizacion(id, data, transaction) {
        return await this.notaDeAutorizacionRepository.actualizarNotaAutorizacion(id, data, transaction);
    }
    

}