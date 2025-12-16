import CursoService from "../../core/services/CursoService.js";
import CursoRepository from "../../core/repositories/CursoRepository.js";

export default class CursoController {

    constructor() {
        this.cursoRepository = new CursoRepository();
        this.cursoService = new CursoService(this.cursoRepository);
    }

    getCursos = async (req, res, next) => {
        try {
            const cursos = await this.cursoService.getCursos();
            res.json(cursos);
        } catch (error) {
            next(error);
        }
    }
}

