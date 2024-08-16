
import {getUsuario, postUsuario, putUsuario, deleteUsuario} from "../controllers/usuario.controllers.js";
import {Router} from "express";
import passport from "passport";

const usuarioRouter = Router();


usuarioRouter.get("/", getUsuario)

usuarioRouter.post("/registrar", passport.authenticate('registrar', {session: false}), postUsuario);


usuarioRouter.put("/", putUsuario)


usuarioRouter.delete("/:cuil", deleteUsuario)

export default usuarioRouter

