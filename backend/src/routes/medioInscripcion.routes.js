import {getMediosInscripcion, putMedioInscripcion} from "../controllers/medioInscripcion.controllers.js"
import {Router} from "express"

const medioInscripcionRouter = Router();

medioInscripcionRouter.get("/", getMediosInscripcion)

medioInscripcionRouter.put("/", putMedioInscripcion)

export default medioInscripcionRouter