
import sequelize from "../../../config/database.js";
import { DateTime } from "luxon";

export default class RegistrarAutorizacionNotaDeAutorizacion {
    constructor({ NotaDeAutorizacionService, CambiosEstadoNotaDeAutorizacionService, HistoricoTutoresEnCursoService, CoordinadorService }, {
        tutores,
        coordinadores,
        autorizador,
        cursos,
        nota_autorizacion
    }) {
        this.NotaDeAutorizacionService = NotaDeAutorizacionService;
        this.CambiosEstadoNotaDeAutorizacionService = CambiosEstadoNotaDeAutorizacionService;
        this.HistoricoTutoresEnCursoService = HistoricoTutoresEnCursoService;
        this.tutores = tutores;
        this.coordinadores = coordinadores;
        this.autorizador = autorizador;
        this.cursos = cursos;
        this.nota_autorizacion = nota_autorizacion;
        this.CoordinadorService = CoordinadorService;

    }

    async ejecutar() {
        // Iniciamos transacción
        const t = await sequelize.transaction();

        try {

            // Actualizamos nota de autorización

            await this.NotaDeAutorizacionService.actualizar(this.nota_autorizacion.id, { autorizador_cuil: this.autorizador.cuil }, t)

            // Creamos Coordinadores

            for (const coordinador of this.coordinadores) {
                await this.CoordinadorService.crear({
                    cuil: coordinador.cuil,
                    nota_autorizacion_id: this.nota_autorizacion.id

                }, t)
            }

            // Actualizamos cambio de estado de nota de autorización

            const fechaActual = DateTime.now().setZone('America/Argentina/Buenos_Aires').toJSDate();

            // Buscamos último estado de nota de autorizacion

            const ultimoCambioEstado = await this.CambiosEstadoNotaDeAutorizacionService.getEstadoActualDeNotaDeAutorizacion(this.nota_autorizacion.id);

            // actualizamos con fecha_hasta == actual

            if (ultimoCambioEstado) {
                await this.CambiosEstadoNotaDeAutorizacionService.cerrarCambioEstadoNotaDeAutorizacion(ultimoCambioEstado.id, { fecha_hasta: fechaActual }, { transaction: t })
            }

            // Creamos nuevo cambio de estado de nota de autorización

            await this.CambiosEstadoNotaDeAutorizacionService.crear({
                nota_autorizacion_id: this.nota_autorizacion.id,
                fecha_desde: fechaActual,
                fecha_hasta: null,
                estado_nota_autorizacion_cod: "AUT"
            }, { transaction: t })

            // Creamos HistoricoTutoresEnCursoService para la nota de autorización

            for (const tutor of this.tutores) {
                await this.HistoricoTutoresEnCursoService.crear({
                    curso_cod: tutor.curso.cod,
                    tutor_cuil: tutor.cuil,
                    rol_tutor_cod: tutor.rol_tutor_cod,
                    fecha_desde: fechaActual,
                    nota_de_autorizacion_id: this.nota_autorizacion.id
                }, t)
            }

            // confirmamos cambios
            await t.commit();


        } catch (error) {
            // Si algo falló, revertimos todos los cambios en la base de datos.
            await t.rollback();
            // relanzamos el error para que el controlador lo maneje.
            throw error;
        }
    }
}
