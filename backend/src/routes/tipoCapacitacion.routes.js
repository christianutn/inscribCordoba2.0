import {getTiposCapacitacion} from "../controllers/tipoCapacitacion.controllers.js";
import {Router} from "express";


const tipoCapacitacionRouter = Router();

tipoCapacitacionRouter.get("/", getTiposCapacitacion)


export default tipoCapacitacionRouter
