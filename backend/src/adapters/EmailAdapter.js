import nodemailer from 'nodemailer';
import config from '../config/env.config.js';

/**
 * Adapter de Email para enviar correos electrónicos.
 * Utiliza nodemailer y las credenciales configuradas en el sistema.
 */
class EmailAdapter {
    constructor() {
        // Crear el transporter con la configuración centralizada
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });
    }

    /**
     * Envía un correo electrónico
     * @param {string} destinatario - Correo del destinatario
     * @param {string} asunto - Asunto del correo
     * @param {string} htmlMensaje - Mensaje en formato HTML
     * @param {Array} attachments - Opcional. Array de adjuntos en formato nodemailer
     * @returns {Promise<Object>} - Información del envío
     * @throws {Error} - Si falla el envío del correo
     */
    async enviarCorreo(destinatario, asunto, htmlMensaje, attachments = []) {
        const mailOptions = {
            from: `"InscribCórdoba" <${config.email.user}>`,
            to: destinatario,
            subject: asunto,
            html: htmlMensaje
        };

        // Agregar adjuntos si existen
        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Correo enviado con éxito!");
            console.log("Message ID:", info.messageId);
            return info;
        } catch (error) {
            console.error("Error al enviar correo:", error);
            throw new Error(`Error al enviar correo: ${error.message}`);
        }
    }

    /**
     * Genera el HTML para notificar el registro de una nota de autorización
     * @param {Object} datosUsuario - Datos del usuario que registró la nota
     * @param {string} datosUsuario.nombre - Nombre del usuario
     * @param {string} datosUsuario.apellido - Apellido del usuario
     * @param {string} datosUsuario.cuil - CUIL del usuario
     * @param {string} datosUsuario.nombreArea - Nombre del área
     * @param {number} notaAutorizacionId - ID de la nota de autorización
     * @param {string} urlBase - URL base del frontend (ej: https://inscribcordoba.test.cba.gov.ar)
     * @returns {string} - HTML del mensaje
     */
    generarHtmlNotificacionNota(datosUsuario, notaAutorizacionId, urlBase) {
        const { nombre, apellido, cuil, nombreArea } = datosUsuario;
        const urlPdf = `${urlBase}/uploads/notas_de_autorizacion/${notaAutorizacionId}.pdf`;

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Nota de Autorización Registrada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0066cc;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .info-row {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-left: 4px solid #0066cc;
        }
        .label {
            font-weight: bold;
            color: #0066cc;
        }
        .btn-container {
            text-align: center;
            margin: 25px 0;
        }
        .btn-pdf {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .btn-pdf:hover {
            background-color: #0052a3;
        }
        .footer {
            margin-top: 20px;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Nueva Nota de Autorización Registrada</h2>
    </div>
    <div class="content">
        <p>Se ha registrado una nueva nota de autorización en el sistema InscribCórdoba.</p>
        
        <div class="info-row">
            <span class="label">ID de Nota:</span> ${notaAutorizacionId}
        </div>
        
        <div class="info-row">
            <span class="label">Usuario:</span> ${nombre} ${apellido}
        </div>
        
        <div class="info-row">
            <span class="label">CUIL:</span> ${cuil}
        </div>
        
        <div class="info-row">
            <span class="label">Área:</span> ${nombreArea}
        </div>
        
        <div class="btn-container">
            <a href="${urlPdf}" class="btn-pdf" style="color: white !important;" target="_blank">📄 Ver Nota de Autorización (PDF)</a>
        </div>
        
        <p style="margin-top: 20px; font-size: 13px; color: #666;">
            Esta notificación es automática. Por favor, revise el sistema para más detalles.
        </p>
    </div>
    <div class="footer">
        <p>Sistema InscribCórdoba - Gobierno de Córdoba</p>
        <p>Este es un correo automático, por favor no responder.</p>
    </div>
</body>
</html>
        `;
    }

    /**
     * Envía una notificación sobre el registro de una nota de autorización
     * @param {Object} datosUsuario - Datos del usuario que registró la nota
     * @param {number} notaAutorizacionId - ID de la nota de autorización
     * @param {string} rutaArchivoPdf - Ruta local del archivo PDF a adjuntar
     * @param {string} urlBase - URL base del frontend. Si no se proporciona, se usa la URL configurada según el entorno
     * @returns {Promise<Object>} - Información del envío
     */
    async enviarNotificacionNotaAutorizacion(datosUsuario, notaAutorizacionId, rutaArchivoPdf, urlBase = null) {
        // Si no se proporciona urlBase, se toma de la configuración según el entorno
        const baseUrl = urlBase || config.frontend.url;

        const destinatario = config.email.supportEmail;
        const asunto = `Nueva Nota de Autorización - ${datosUsuario.apellido}, ${datosUsuario.nombre}`;
        const htmlMensaje = this.generarHtmlNotificacionNota(datosUsuario, notaAutorizacionId, baseUrl);

        // Preparar adjuntos
        const attachments = [];

        if (rutaArchivoPdf) {
            attachments.push({
                filename: `Nota_Autorizacion_${notaAutorizacionId}.pdf`,
                path: rutaArchivoPdf,
                contentType: 'application/pdf'
            });
        }

        return await this.enviarCorreo(destinatario, asunto, htmlMensaje, attachments);
    }
}

export default EmailAdapter;
