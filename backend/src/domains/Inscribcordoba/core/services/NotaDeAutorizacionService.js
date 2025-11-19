import NotaDeAutorizacionRepository from "../repositories/NotaDeAutorizacionRepository.js"


export default class NotaDeAutorizacionService {

    async getNotasDeAutorizacion() {
        const notaDeAutorizacionRepository = new NotaDeAutorizacionRepository();
        return await notaDeAutorizacionRepository.getNotasDeAutorizacion();
    }

    

}