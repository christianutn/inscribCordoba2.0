import CidiService from '../../../../services/CidiService.js';
import Usuario from '../models/usuario.models.js';
import Persona from '../models/persona.models.js';
import generarToken from '../../../../utils/jwt.js';
import logger from '../../../../utils/logger.js';

/**
 * POST /api/auth/cidi
 * Recibe el hashCookie de CiDi, valida al usuario contra la API de CiDi,
 * busca o crea el usuario en la DB local, y devuelve un JWT interno.
 */
export const loginConCidi = async (req, res, next) => {
    try {
        const { hashCookie } = req.body;

        if (!hashCookie) {
            const error = new Error("Se requiere el hashCookie de CiDi");
            error.statusCode = 400;
            throw error;
        }

        // 1. Validar hashCookie contra la API de CiDi
        const cidiService = new CidiService();
        const datosCidi = await cidiService.obtenerUsuarioAplicacion(hashCookie);

        // obtenerUsuarioAplicacion ya lanza error si Respuesta.Resultado !== "OK"
        // Si llegamos aquí, el login en CiDi fue exitoso

        const cuil = datosCidi.CUIL; // Ej: "20378513376"
        const nombre = datosCidi.Nombre; // Ej: "Christian Javier"
        const apellido = datosCidi.Apellido; // Ej: "Bergero"
        const email = datosCidi.Email || null;
        const celular = datosCidi.CelNro || null;

        logger.info(`🔑 Login CiDi exitoso - CUIL: ${cuil} - ${apellido}, ${nombre}`);


        // 2. Buscar el Usuario en la DB local
        const usuario = await Usuario.findByPk(cuil);

        if (!usuario) {
            // El usuario NO existe en la tabla usuarios → no está autorizado a usar la app
            const error = new Error(
                "Tu identidad fue verificada por CiDi, pero no tenés un usuario autorizado en InscribCórdoba. " +
                "Contactá al administrador para que te asigne acceso."
            );
            error.statusCode = 403;
            throw error;
        }

        if (usuario.activo === 0) {
            const error = new Error("Tu usuario se encuentra desactivado. Contactá al administrador.");
            error.statusCode = 403;
            throw error;
        }

        // 3. Buscar la Persona en la DB local
        const persona = await Persona.findByPk(cuil);

        if (!persona) {
            const error = new Error(
                "Tu identidad fue verificada por CiDi, pero no se encontró tu persona registrada en InscribCórdoba. " +
                "Contactá al administrador para que te asigne acceso."
            );
            error.statusCode = 403;
            throw error;
        }


        // 4. Generar JWT interno con la misma estructura que usa el login local
        const datosParaToken = {
            cuil: usuario.cuil,
            rol: usuario.rol,
            area: usuario.area,
            nombre: persona.nombre,
            apellido: persona.apellido,
            token_version: usuario.token_version,
            necesitaCbioContrasenia: usuario.necesitaCbioContrasenia,
            esExcepcionParaFechas: usuario.esExcepcionParaFechas,
            activo: usuario.activo,
        };

        const token = generarToken(datosParaToken);

        console.log("Token generado vía CiDi:", token);

        logger.info(`✅ JWT generado vía CiDi - Usuario: ${apellido}, ${nombre} (${cuil}) - Rol: ${usuario.rol}`);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        };

        res.cookie('jwt', token, cookieOptions);
        res.status(200).json({ message: "Login exitoso", usuario: datosParaToken });

    } catch (error) {
        logger.error(`❌ Error en login CiDi: ${error.message}`, { stack: error.stack });
        next(error);
    }
};

export const logout = (req, res) => {
    res.clearCookie('jwt', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    });
    res.status(200).json({ message: "Sesión cerrada" });
};
