import {getEstados} from "../controllers/estado.controllers.js";
import {Router} from "express";


const estadoRouter = Router();

estadoRouter.get("/", getEstados)


export default estadoRouter