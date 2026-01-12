import GoogleDrive from "../../../services/GoogleDriveService.js"
import sequelize from "../../../config/database.js";
import { DateTime } from "luxon";


class RegistrarNotaDeAutorizacion {

    constructor(archivo_nota_autorizacion, cuil_usuario, apellido_coordinador, cod_area,
        {
            googleDriveService,
            notaDeAutorizacionService,
            manejadorArchivos,
            cambiosEstadoNotaDeAutorizacionService,
            emailAdapter,
            personaModel,
            areaModel

        }) {
        this.archivo_nota_autorizacion = archivo_nota_autorizacion;
        this.cuil_usuario = cuil_usuario;
        this.apellido_coordinador = apellido_coordinador;
        this.cod_area = cod_area;

        // Inyección de dependencias
        this.googleDrive = googleDriveService;
        this.notaDeAutorizacionService = notaDeAutorizacionService;
        this.manejadorArchivos = manejadorArchivos;
        this.cambiosEstadoNotaDeAutorizacionService = cambiosEstadoNotaDeAutorizacionService;
        this.emailAdapter = emailAdapter;
        this.personaModel = personaModel;
        this.areaModel = areaModel;

    }

    async ejecutar() {
        // Iniciamos transacción
        const t = await sequelize.transaction();

        try {
            // 1. Creamos fecha actual de Argentina con formato AAAA-MM-DD
            const fechaActual = DateTime.now().setZone('America/Argentina/Buenos_Aires').toISODate();

            // 2. Creamos la nota de autorización en la DB dentro de la transacción
            const nuevaNotaAutorizacion = await this.notaDeAutorizacionService.crearNotaAutorizacion(this.cuil_usuario, fechaActual, t);



            // Queda pendiente ya que se necesita una cuenta workpace
            // await this.googleDrive.uploadFile(this.archivo_nota_autorizacion, this.cod_area, this.apellido_coordinador, nuevaNotaAutorizacion.id);

            // 4. Guardamos localmente el archivo. Si esto falla, el catch hará rollback.
            const respuestaGuardadoArchivo = await this.manejadorArchivos.guardarNotaDeAutorizacionLocalmente(nuevaNotaAutorizacion.id, this.archivo_nota_autorizacion);

            // 5. Actualizamos la nota con la ruta local, dentro de la misma transacción.
            await this.notaDeAutorizacionService.actualizar(
                nuevaNotaAutorizacion.id,
                { ruta_archivo_local: respuestaGuardadoArchivo.rutaRelativa },
                t
            );

            // 6. Debo además crear el cambio de estado de nota de autorización

            await this.cambiosEstadoNotaDeAutorizacionService.crear({
                nota_autorizacion_id: nuevaNotaAutorizacion.id,
                fecha_desde: fechaActual,
                estado_nota_autorizacion_cod: "PEND"

            },
                {
                    transaction: t
                }
            )

            // 7. Enviamos correo a soporte indicando que se registró una nota de autorización
            // Obtenemos datos del usuario
            const persona = await this.personaModel.findByPk(this.cuil_usuario);
            if (!persona) {
                throw new Error(`No se encontró la persona con CUIL: ${this.cuil_usuario}`);
            }

            // Obtenemos datos del área
            const area = await this.areaModel.findByPk(this.cod_area);
            if (!area) {
                throw new Error(`No se encontró el área con código: ${this.cod_area}`);
            }

            // Preparamos los datos para el correo
            const datosUsuario = {
                nombre: persona.nombre,
                apellido: persona.apellido,
                cuil: persona.cuil,
                nombreArea: area.nombre
            };

            // Enviamos el correo. Si falla, se lanzará una excepción y se hará rollback
            await this.emailAdapter.enviarNotificacionNotaAutorizacion(
                datosUsuario,
                nuevaNotaAutorizacion.id,
                respuestaGuardadoArchivo.ruta // Ruta completa del archivo PDF guardado
            );

            // 8. Si todo fue exitoso (incluyendo el envío del correo), confirmamos la transacción.
            await t.commit();

            return respuestaGuardadoArchivo;

        } catch (error) {
            // Si algo falló, revertimos todos los cambios en la base de datos.
            await t.rollback();
            // relanzamos el error para que el controlador lo maneje.
            throw error;
        }
    }




}




export default RegistrarNotaDeAutorizacion;