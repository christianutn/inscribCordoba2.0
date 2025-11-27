
export default class HistoricoTutoresEnCursoService {

   constructor({ repositorioHistoricoTutoresEnCursoRepository }) {
      this.repositorioHistoricoTutoresEnCurso = repositorioHistoricoTutoresEnCursoRepository;
   }

   async crear(data, transacción) {
      return await this.repositorioHistoricoTutoresEnCurso.crear(data, transacción);
   }

}