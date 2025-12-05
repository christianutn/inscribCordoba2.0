import HistoricoTutoresEnCursoRepository from "../../core/repositories/HistoricoTutoresEnCursoRepository.js";
import HistoricoTutoresEnCursoService from "../../core/services/HistoricoTutoresEnCursoService.js"
import { DateTime } from "luxon";

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

    async asignarNuevoRol(req, res, next) {
        try {

            const { tutor_cuil, curso_cod, rol_tutor_cod } = req.body;

            const usuario_cuil = req.user.user.cuil;
            const fecha_desde = DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate();

            const historicoTutoresEnCursoVigentes = await this.historicoTutoresEnCursoService.asignarNuevoRol(tutor_cuil, curso_cod, rol_tutor_cod, usuario_cuil, fecha_desde);

            res.status(201).json(historicoTutoresEnCursoVigentes);
        } catch (error) {
            next(error);
        }
    }



}

