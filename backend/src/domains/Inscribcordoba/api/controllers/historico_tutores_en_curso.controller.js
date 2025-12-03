import HistoricoTutoresEnCursoRepository from "../../core/repositories/HistoricoTutoresEnCursoRepository.js";
import HistoricoTutoresEnCursoService from "../../core/services/HistoricoTutoresEnCursoService.js";

export default class HistoricoTutoresEnCursoController {
    constructor() {
        this.historicoTutoresEnCursoService = new HistoricoTutoresEnCursoService({
            repositorioHistoricoTutoresEnCursoRepository: new HistoricoTutoresEnCursoRepository()
        });
    }

    async getHistoricoTutoresVigentesPorCurso(req, res, next) {
        try {
            const { curso_cod } = req.params;
            const historicoTutoresEnCursoVigentes = await this.historicoTutoresEnCursoService.getHistoricoTutoresVigentesPorCurso(curso_cod);

            res.status(200).json(historicoTutoresEnCursoVigentes);
        } catch (error) {
            next(error);
        }
    }
}