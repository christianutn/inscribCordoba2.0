import CoordinadorModel from "../../api/models/coordinadores.models.js";

export default class CoordinadorRepository {

    constructor() {
        this.coordinadorModel = CoordinadorModel;
    }

    async crear(data, transaction) {
        return await this.coordinadorModel.create(data, { transaction });
    }

}