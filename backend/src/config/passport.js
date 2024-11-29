import passport from 'passport';
import passportLocal from 'passport-local';
import Usuario from "../models/usuario.models.js"
import { createHash, validatePassword } from "../utils/bcrypt.js"
import jwt from 'passport-jwt'
import 'dotenv/config';

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

                done(null, false);
            }

            if (!validatePassword(String(contrasenia), usuario.contrasenia)) {

                done(null, false);
            }


            done(null, usuario);
        } catch (error) {
            done(error)
        }
    }));

}

export default inicializarPassport