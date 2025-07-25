import passport from 'passport';
import passportLocal from 'passport-local';
import Usuario from "../models/usuario.models.js"
import { createHash, validatePassword } from "../utils/bcrypt.js"
import jwt from 'passport-jwt'
import 'dotenv/config';
import Persona from '../models/persona.models.js';
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

            return done(null, jwt_payload)
        } catch (error) {
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

            const usuario = await Usuario.findOne({ where: { cuil: cuil } });
            if (!usuario) {
                logger.info(`Error en postLogin: Usuario: No existe`); 
                return done(null, false);
            }

            if (!validatePassword(String(contrasenia), usuario.contrasenia)) {
                logger.info(`Error en postLogin: Usuario: ${usuario.nombre} (Contraseña/Usuario incorrectos)`);
                return done(null, false);
            }

            const persona = await Persona.findOne({ where: { cuil: cuil } });
            if (!persona) {
                return done(null, false);
            }

            const datosUsuario = { ...usuario.dataValues, nombre: persona.nombre, apellido: persona.apellido } //Unifico los datos del usuario y de la persona para que se guarde en la sesión

            return done(null, datosUsuario); //Devuelvo el usuario y la persona para que se guarde en la sesión;
        } catch (error) {

           return done(error)
        }
    }));


}

export default inicializarPassport