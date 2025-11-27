import HistoricoTutoresEnCursoModel from "../../api/models/historico_tutores_en_curso.models.js";

export default class HistoricoTutoresEnCursoRepository {

    constructor() {
        this.historicoTutoresEnCursoModel = HistoricoTutoresEnCursoModel;
    }

    async crear(data, transaction) {
        return await this.historicoTutoresEnCursoModel.create(data, { transaction });
    }

}