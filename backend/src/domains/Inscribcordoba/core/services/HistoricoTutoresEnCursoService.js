
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

   async asignarNuevoRol(tutor_cuil, curso_cod, rol_tutor_cod, usuario_cuil, fecha_desde) {
      const data = {
         tutor_cuil,
         curso_cod,
         rol_tutor_cod,
         usuario_cuil,
         fecha_desde
      };
      return await this.repositorioHistoricoTutoresEnCurso.crear(data);
   }
}