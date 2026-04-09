import nodemailer from 'nodemailer';

/**
 * Sistema de alertas por email, DESACOPLADO del SMTP principal.
 * 
 * Estrategia de redundancia:
 *  1. Intenta enviar desde el SMTP principal (Gmail del sistema)
 *  2. Si falla el SMTP principal (lo cual es probable si el check SMTP falló),
 *     loguea el error pero no lanza excepción
 *  3. Envía a TODOS los emails de alerta configurados
 * 
 * Los emails se configuran via MONITORING_ALERT_EMAILS en .env
 * Formato: "email1@gmail.com,email2@outlook.com"
 */

/**
 * Construye el HTML del email de alerta
 * @param {Array} failures - Lista de checks que fallaron
 * @returns {string} - HTML del email
 */
const buildAlertHtml = (failures) => {
    const timestamp = new Date().toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        dateStyle: 'full',
        timeStyle: 'long'
    });

    const failureRows = failures.map(f => `
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #c0392b;">
                ${f.service}
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">
                ${f.message}
            </td>
            <td style="padding: 10px; border: 1px solid #ddd; font-size: 0.9em; color: #666;">
                ${f.details || 'Sin detalles adicionales'}
            </td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Alerta de Monitoreo - InscribCórdoba</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8f8f8; color: #333;">
    <div style="max-width: 700px; margin: 20px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header rojo de alerta -->
        <div style="background-color: #e74c3c; color: white; padding: 20px 25px;">
            <h2 style="margin: 0; font-size: 1.3em;">🚨 Alerta de Monitoreo - InscribCórdoba</h2>
            <p style="margin: 5px 0 0 0; font-size: 0.9em; opacity: 0.9;">
                Se detectaron ${failures.length} servicio(s) con problemas
            </p>
        </div>

        <div style="padding: 25px;">
            <!-- Tabla de servicios que fallaron -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f8f8f8;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Servicio</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Error</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    ${failureRows}
                </tbody>
            </table>

            <!-- Info extra -->
            <div style="background-color: #fef9e7; border-left: 4px solid #f39c12; padding: 15px; border-radius: 4px;">
                <strong>⏰ Fecha y hora:</strong> ${timestamp}<br/>
                <strong>🔧 Acción requerida:</strong> Revisar los servicios indicados y corregir los problemas lo antes posible.
            </div>
        </div>

        <div style="padding: 15px 25px; background-color: #f8f8f8; text-align: center; font-size: 0.85em; color: #999;">
            Este es un correo automático del sistema de monitoreo de InscribCórdoba.
        </div>
    </div>
</body>
</html>`;
};

/**
 * Envía alertas por email a los destinatarios configurados
 * @param {Array} failures - Lista de checks que fallaron
 *   Cada elemento: { service: string, message: string, details?: string }
 * @returns {Object} { sent: boolean, message: string }
 */
const sendEmailAlert = async (failures) => {
    if (!failures || failures.length === 0) {
        return { sent: false, message: 'No hay fallas que reportar' };
    }

    // Obtener emails de alerta desde .env
    const alertEmails = process.env.MONITORING_ALERT_EMAILS
        || process.env.EMAIL_RECIPIENTS
        || process.env.EMAIL_USER;

    if (!alertEmails) {
        console.error('[MONITORING] [ALERTA] No hay emails de alerta configurados (MONITORING_ALERT_EMAILS)');
        return { sent: false, message: 'No hay emails de alerta configurados' };
    }

    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;

    if (!smtpUser || !smtpPass) {
        console.error('[MONITORING] [ALERTA] No se puede enviar alerta: credenciales SMTP no configuradas');
        return { sent: false, message: 'Credenciales SMTP no disponibles para enviar alerta' };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
        });

        const serviciosAfectados = failures.map(f => f.service).join(', ');

        const mailOptions = {
            from: `"InscribCórdoba - Monitoreo" <${smtpUser}>`,
            to: alertEmails, // Nodemailer acepta string separado por comas
            subject: `🚨 Alerta Monitoreo: ${failures.length} servicio(s) con problemas - ${serviciosAfectados}`,
            html: buildAlertHtml(failures)
        };

        await transporter.sendMail(mailOptions);

        console.log(`[MONITORING] [ALERTA] Email de alerta enviado a: ${alertEmails}`);
        return { sent: true, message: `Alerta enviada a: ${alertEmails}` };

    } catch (error) {
        // Si el SMTP falla (probablemente porque es el servicio que estamos alertando),
        // logueamos pero NO lanzamos excepción
        console.error(`[MONITORING] [ALERTA] Error al enviar email de alerta: ${error.message}`);
        console.error('[MONITORING] [ALERTA] ⚠️ La alerta NO pudo ser enviada. Revisar logs manualmente.');
        return { sent: false, message: `Error al enviar alerta: ${error.message}` };
    }
};

export default sendEmailAlert;
