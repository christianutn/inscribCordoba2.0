
import { getUsuario, postUsuario, putUsuario, deleteUsuario, getMyUser, updateContrasenia, recuperoContrasenia } from "../domains/Inscribcordoba/api/controllers/usuario.controllers.js";
import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import manejarValidacionErrores from "../utils/manejarValidacionErrores.js";
import { validateCreateUsuario, validateUpdateUsuario, validateDeleteUsuario } from "../middlewares/validations/usuario.validations.js";



const usuarioRouter = Router();


usuarioRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), getUsuario)

usuarioRouter.post("/registrar",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    validateCreateUsuario,
    manejarValidacionErrores,
    postUsuario);

usuarioRouter.put("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    validateUpdateUsuario,
    manejarValidacionErrores,
    putUsuario)

usuarioRouter.delete("/:cuil",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),
    validateDeleteUsuario,
    manejarValidacionErrores,
    deleteUsuario)

usuarioRouter.get("/myuser", passport.authenticate('jwt', { session: false }), getMyUser)

usuarioRouter.put("/contrasenia", passport.authenticate('jwt', { session: false }), updateContrasenia)

usuarioRouter.put("/recuperoContrasenia", recuperoContrasenia) //Envia correo para con el enlace para recuperar la contraseña. No neesita de jwt ya que este es enviado luego al correo del usuario




export default usuarioRouter

