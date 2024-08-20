
import {getUsuario, postUsuario, putUsuario, deleteUsuario, getMyUser} from "../controllers/usuario.controllers.js";
import {Router} from "express";
import passport from "passport";


const usuarioRouter = Router();


usuarioRouter.get("/", getUsuario)

usuarioRouter.post("/registrar", passport.authenticate('registrar', {session: false}), postUsuario);


usuarioRouter.put("/", putUsuario)


usuarioRouter.delete("/:cuil", deleteUsuario)

usuarioRouter.get("/myuser", passport.authenticate('jwt', {session:false}), getMyUser)



export default usuarioRouter

