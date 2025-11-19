import NotaDeAutorizacion from "../../api/models/notas_autorizacion.models.js";

export default class NotaDeAutorizacionRepository {
  async createNotaDeAutorizacion(data) {
    return await NotaDeAutorizacion.create(data);
  }

  async getNotasDeAutorizacion() {
    return await NotaDeAutorizacion.findAll();
  }

  async crearNotaAutorizacion(usuario_cuil, fechaActual, transaction = null) {
    
    return await NotaDeAutorizacion.create({
      usuario_cuil: usuario_cuil,
      fecha_desde: fechaActual
    }, { transaction });
  }
  
  async actualizarNotaAutorizacion(id, data, transaction = null) {
    return await NotaDeAutorizacion.update(data, {
      where: {
        id: id,
      },
      transaction
    });
  }
}
