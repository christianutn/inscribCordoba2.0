
import sequelize from "../../../config/database.js";
import { DateTime } from "luxon";

export default class RegistrarAutorizacionNotaDeAutorizacion {
    constructor({
        NotaDeAutorizacionService,
        CambiosEstadoNotaDeAutorizacionService,
        HistoricoTutoresEnCursoService,
        CoordinadorService,
        generarHtmlAutorizacion,
        enviarCorreo
    }, {
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
        this.generarHtmlAutorizacion = generarHtmlAutorizacion;
        this.enviarCorreo = enviarCorreo;
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

            // Obtenemos los datos de la nota de autorización
            const notaDeAutorizacion = await this.NotaDeAutorizacionService.getNotaAutorizacionPorId(this.nota_autorizacion.id);

            // Enviamos correo
            await this.enviarCorreo(this.generarHtmlAutorizacion(notaDeAutorizacion.detalle_usuario.detalle_persona.nombre, notaDeAutorizacion.detalle_usuario.detalle_persona.apellido),
                "Nota de autorización autorizada",
                notaDeAutorizacion.detalle_usuario.detalle_persona.mail
            );
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


