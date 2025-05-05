
import { getUsuario, postUsuario, putUsuario, deleteUsuario, getMyUser, updateContrasenia, recuperoContrasenia } from "../controllers/usuario.controllers.js";
import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const usuarioRouter = Router();


usuarioRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), getUsuario)

usuarioRouter.post("/registrar", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), postUsuario);

usuarioRouter.put("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), putUsuario)

usuarioRouter.delete("/:cuil", deleteUsuario)

usuarioRouter.get("/myuser", passport.authenticate('jwt', { session: false }), getMyUser)

usuarioRouter.put("/contrasenia", passport.authenticate('jwt', { session: false }), updateContrasenia)
usuarioRouter.put("/recuperocontrasenia", recuperoContrasenia)



export default usuarioRouter

