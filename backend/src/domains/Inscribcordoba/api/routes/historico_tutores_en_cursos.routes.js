import passport from "passport";
import { Router } from "express";
import HistoricoTutoresEnCursoController from "../controllers/historico_tutores_en_curso.controller.js";
import autorizar from '../../../../utils/autorizar.js';

const router = Router();
const historicoTutoresEnCursoController = new HistoricoTutoresEnCursoController();

router.get('/:curso_cod', passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'REF', 'GA']), historicoTutoresEnCursoController.getHistoricoTutoresVigentesPorCurso.bind(historicoTutoresEnCursoController));

export default router;
