import nodemailer from 'nodemailer';

/**
 * Check de salud para el servidor SMTP.
 * 
 * Crea un transporter de nodemailer con las credenciales configuradas
 * y ejecuta verify() para validar conexión + autenticación sin enviar
 * un correo real.
 * 
 * @returns {Object} { success: boolean, message: string, details?: string }
 */
const checkSmtp = async () => {
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;

    // Validar que las credenciales existan
    if (!smtpUser || !smtpPass) {
        return {
            success: false,
            message: 'Credenciales SMTP no configuradas',
            details: 'Las variables EMAIL_USER y/o EMAIL_PASS están vacías en el .env'
        };
    }

    try {
        // Crear transporter con las mismas credenciales que usa el sistema
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            // Timeout para evitar que quede colgado
            connectionTimeout: 10000, // 10 segundos
            greetingTimeout: 10000,
        });

        // verify() verifica conexión + autenticación sin enviar nada
        await transporter.verify();

        return {
            success: true,
            message: 'Conexión SMTP verificada correctamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Fallo en la verificación SMTP',
            details: error.message
        };
    }
};

export default checkSmtp;
