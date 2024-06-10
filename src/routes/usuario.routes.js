import {getUsuario} from "../controllers/usuario.controllers.js";
import {Router} from "express";


const usuarioRouter = Router();


usuarioRouter.get("/", getUsuario)

export default usuarioRouter

