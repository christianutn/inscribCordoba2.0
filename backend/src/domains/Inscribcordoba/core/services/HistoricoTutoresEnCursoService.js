
export default class HistoricoTutoresEnCursoService {

   constructor({ repositorioHistoricoTutoresEnCursoRepository }) {
      this.repositorioHistoricoTutoresEnCurso = repositorioHistoricoTutoresEnCursoRepository;
   }

   async crear(data, transacción) {
      return await this.repositorioHistoricoTutoresEnCurso.crear(data, transacción);
   }

   async getHistoricoTutoresPorCurso(curso_cod) {
      return await this.repositorioHistoricoTutoresEnCurso.getHistoricoTutoresPorCurso(curso_cod);
   }

   async getHistoricoTutoresVigentesPorCurso(curso_cod) {
      return await this.repositorioHistoricoTutoresEnCurso.getHistoricoTutoresVigentesPorCurso(curso_cod);
   }
}