import NotaDeAutorizacion from "../../api/models/notas_autorizacion.models.js";
import Usuario from "../../api/models/usuario.models.js";
import Autorizador from "../../api/models/autorizador.models.js";
import Persona from "../../api/models/persona.models.js";

export default class NotaDeAutorizacionRepository {
  async createNotaDeAutorizacion(data) {
    return await NotaDeAutorizacion.create(data);
  }

  async getNotasDeAutorizacion() {
    return await NotaDeAutorizacion.findAll({
      include: [
        {
          model: Autorizador,
          as: 'detalle_autorizador',
          include: [
            {
              model: Persona,
            }
          ]
        },
        {
          model: Usuario,
          as: 'detalle_usuario',
          include: [
            {
              model: Persona,
              as: 'detalle_persona'
            }
          ]
        }
      ]
    });
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
