import passport from 'passport';
import passportLocal from 'passport-local';
import Usuario from "../domains/Inscribcordoba/api/models/usuario.models.js"
import { createHash, validatePassword } from "../utils/bcrypt.js"
import jwt from 'passport-jwt'
import 'dotenv/config';
import Persona from '../domains/Inscribcordoba/api/models/persona.models.js';
import logger from '../utils/logger.js';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt //Extrar de las cookies el token


const inicializarPassport = () => {


    const cookieExtractor = req => {


        // Tomamos el token de los headers de autorización, si existe
        let token = req.headers.authorization ? req.headers.authorization : '';

        // Verificamos si el token es una cadena y si comienza con 'Bearer '
        if (typeof token === 'string' && token.startsWith('Bearer ')) {
            // Si es así, eliminamos la palabra 'Bearer ' del inicio
            token = token.slice(7, token.length);
        }

        return token;

    }

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]), //El token va a venir desde cookieExtractor
        secretOrKey: process.env.JWT_SECRET
    }, async (jwt_payload, done) => { //jwt_payload = info del token (en este caso, datos del cliente)
        try {
            logger.info(`🔐 Token JWT válido - Usuario: ${jwt_payload.user?.cuil || 'N/A'} - Rol: ${jwt_payload.user?.id_rol || 'N/A'}`);
            return done(null, jwt_payload)
        } catch (error) {
            logger.error(`❌ Error al validar token JWT: ${error.message}`, { stack: error.stack });
            return done(error)
        }

    }))

    passport.use("login", new LocalStrategy({
        usernameField: 'cuil', // Cambia esto al campo que usas para el nombre de usuario
        passwordField: 'contrasenia', // Cambia esto al campo que usas para la contraseña
        passReqToCallback: true //Opción para tomar datos del body
    }, async function (req, cuil, contrasenia, done) {
        // Login
        try {
            logger.info(`🔑 Intento de login - CUIL: ${cuil}`);

            const usuario = await Usuario.findOne({ where: { cuil: cuil } });
            if (!usuario) {
                logger.warn(`⚠️ Login fallido - Usuario no existe - CUIL: ${cuil}`);
                return done(null, false);
            }

            if (!validatePassword(String(contrasenia), usuario.contrasenia)) {
                logger.warn(`⚠️ Login fallido - Contraseña incorrecta - CUIL: ${cuil}`);
                return done(null, false);
            }

            const persona = await Persona.findOne({ where: { cuil: cuil } });
            if (!persona) {
                logger.warn(`⚠️ Login fallido - Persona no encontrada en DB - CUIL: ${cuil}`);
                return done(null, false);
            }

            const datosUsuario = { ...usuario.dataValues, nombre: persona.nombre, apellido: persona.apellido } //Unifico los datos del usuario y de la persona para que se guarde en la sesión

            logger.info(`✅ Login exitoso - Usuario: ${persona.apellido}, ${persona.nombre} (${cuil}) - Rol: ${usuario.rol}`);
            return done(null, datosUsuario); //Devuelvo el usuario y la persona para que se guarde en la sesión;
        } catch (error) {
            logger.error(`❌ Error crítico en login - CUIL: ${cuil} - Error: ${error.message}`, {
                stack: error.stack,
                cuil: cuil
            });
            return done(error)
        }
    }));


}

export default inicializarPassport