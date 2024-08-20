import {getTiposCapacitacion, postTiposCapacitacion, deleteTiposCapacitacion, putTiposCapacitacion} from "../controllers/tipoCapacitacion.controllers.js";
import {Router} from "express";


const tipoCapacitacionRouter = Router();

tipoCapacitacionRouter.get("/", getTiposCapacitacion)
tipoCapacitacionRouter.post("/", postTiposCapacitacion)
tipoCapacitacionRouter.put("/", putTiposCapacitacion)
tipoCapacitacionRouter.delete("/:cod", deleteTiposCapacitacion)

export default tipoCapacitacionRouter
