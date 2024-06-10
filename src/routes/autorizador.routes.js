import {getUsuario} from "../controllers/usuario.controllers.js";
import { Router } from "express";

const autorizadorRouter = Router();


autorizadorRouter.get("/", getUsuario)

export default autorizadorRouter