

export default class CoordinadorService {

    constructor({ CoordinadorRepository }) {
        this.CoordinadorRepository = CoordinadorRepository;
    }

    async crear(data, transaction) {
        return await this.CoordinadorRepository.crear(data, transaction);
    }
}