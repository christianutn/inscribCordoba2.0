import NotaDeAutorizacion from "../../api/models/notas_autorizacion.models.js";

export default class NotaDeAutorizacionRepository {
  async createNotaDeAutorizacion(data) {
    return await NotaDeAutorizacion.create(data);
  }

  async getNotasDeAutorizacion() {
    return await NotaDeAutorizacion.findAll();
  }

}
