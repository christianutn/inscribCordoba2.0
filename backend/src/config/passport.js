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


        //En lugar de tomar de las cookies directamente todo de la peticion
        let token = req.headers.authorization ? req.headers.authorization : {}

        //Si token comienza con Bearer se quita. Se implenta para implementación de Swagger que en autorization devuelve
        // el req.headers.authorization con el Bearer delante,  distinto a como lo pasamos por poarte del cliente
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length)
        }



        return token

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
            done(null,usuario);
        } catch (error) {
            done(error)
        }
    }));

}

export default inicializarPassport