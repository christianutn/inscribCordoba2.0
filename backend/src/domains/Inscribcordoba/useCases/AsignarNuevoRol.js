import sequelize from "../../../config/database";
import AppError from "../../../utils/appError.js";

export default class AsignarNuevoRol {
    constructor({
        HistoricoTutoresEnCursoService,
        data_body,
        usuario_cuil,
        fecha_desde,

    }) {
        this.historicoTutoresEnCursoService = HistoricoTutoresEnCursoService;
        this.data_body = data_body;
        this.usuario_cuil = usuario_cuil;
        this.fecha_desde = fecha_desde;

    }

    async ejecutar() {
        try {

            await this.historicoTutoresEnCursoService.crear({
                curso_cod: this.data_body.curso_cod,
                tutor_cuil: this.data_body.tutor_cuil,
                rol_tutor_cod: this.data_body.rol_tutor_cod,
                fecha_desde: this.fecha_desde,
                nota_de_autorizacion_id: this.data_body.nota_de_autorizacion_id,
                usuario_cuil: this.usuario_cuil
            })

        } catch (error) {
            throw new AppError(error.message, error.statusCode);
        }
    }
}