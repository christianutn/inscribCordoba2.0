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
        let archivoGuardado = null; // Tracking del archivo para limpieza en caso de error

        try {
            // 1. Creamos fecha actual de Argentina con formato AAAA-MM-DD
            const fechaActual = DateTime.now().setZone('America/Argentina/Buenos_Aires').toISODate();

            // 2. Creamos la nota de autorización en la DB dentro de la transacción
            const nuevaNotaAutorizacion = await this.notaDeAutorizacionService.crearNotaAutorizacion(this.cuil_usuario, fechaActual, t);

            // 3. Guardamos localmente el archivo. Si esto falla, el catch hará rollback.
            const respuestaGuardadoArchivo = await this.manejadorArchivos.guardarNotaDeAutorizacionLocalmente(nuevaNotaAutorizacion.id, this.archivo_nota_autorizacion);

            // Marcamos que el archivo fue guardado (para compensación en caso de error)
            archivoGuardado = respuestaGuardadoArchivo;

            // 4. Actualizamos la nota con la ruta local, dentro de la misma transacción.
            await this.notaDeAutorizacionService.actualizar(
                nuevaNotaAutorizacion.id,
                { ruta_archivo_local: respuestaGuardadoArchivo.rutaRelativa },
                t
            );

            // 5. Creamos el cambio de estado de nota de autorización
            await this.cambiosEstadoNotaDeAutorizacionService.crear({
                nota_autorizacion_id: nuevaNotaAutorizacion.id,
                fecha_desde: fechaActual,
                estado_nota_autorizacion_cod: "PEND"

            },
                {
                    transaction: t
                }
            )

            // 6. Enviamos correo a soporte indicando que se registró una nota de autorización
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

            // 7. Si todo fue exitoso (incluyendo el envío del correo), confirmamos la transacción.
            await t.commit();

            return respuestaGuardadoArchivo;

        } catch (error) {
            // Si algo falló, revertimos todos los cambios en la base de datos.
            await t.rollback();

            // Limpieza compensatoria: Si se guardó un archivo físico, lo eliminamos para mantener consistencia
            if (archivoGuardado) {
                await this.eliminarArchivoCompensatorio(archivoGuardado.ruta);
            }

            // Relanzamos el error para que el controlador lo maneje.
            throw error;
        }
    }

    /**
     * Elimina un archivo del sistema de archivos como compensación de una transacción fallida.
     * Este método se ejecuta cuando ocurre un rollback de DB pero ya se había guardado un archivo físico.
     * @param {string} rutaArchivo - Ruta completa del archivo a eliminar
     */
    async eliminarArchivoCompensatorio(rutaArchivo) {
        try {
            const fs = await import('fs/promises');
            await fs.unlink(rutaArchivo);
            console.log(`[COMPENSACIÓN] Archivo eliminado exitosamente: ${rutaArchivo}`);
        } catch (errorEliminacion) {
            // Si falla la eliminación, lo registramos pero NO lanzamos error
            // para no ocultar el error original que causó el rollback
            console.error(`[COMPENSACIÓN] Error al eliminar archivo ${rutaArchivo}:`, errorEliminacion);
            console.error(`[ADVERTENCIA] El archivo ${rutaArchivo} quedó huérfano y debe ser eliminado manualmente.`);
        }
    }




}




export default RegistrarNotaDeAutorizacion;