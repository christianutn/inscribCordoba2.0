import {getAutorizadores} from "../controllers/autorizador.controllers.js";
import { Router } from "express";

const autorizadorRouter = Router();


autorizadorRouter.get("/", getAutorizadores)

export default autorizadorRouter