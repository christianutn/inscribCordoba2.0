
import { getUsuario, postUsuario, putUsuario, deleteUsuario, getMyUser, updateContrasenia, recuperoContrasenia } from "../controllers/usuario.controllers.js";
import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import { validatePassword } from "../utils/bcrypt.js";

const usuarioRouter = Router();


usuarioRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), getUsuario)

usuarioRouter.post("/registrar", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), postUsuario);

usuarioRouter.put("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), putUsuario)

usuarioRouter.delete("/:cuil", deleteUsuario)

usuarioRouter.get("/myuser", passport.authenticate('jwt', { session: false }), getMyUser)

usuarioRouter.put("/contrasenia", passport.authenticate('jwt', { session: false }), updateContrasenia)

usuarioRouter.put("/recuperoContrasenia", recuperoContrasenia) //Envia correo para con el enlace para recuperar la contraseña

usuarioRouter.put("/renovarContrasenia", passport.authenticate('jwt-url-param', { session: false }), updateContrasenia) //Validamos el token de la url para el cambio de contraseña



export default usuarioRouter

