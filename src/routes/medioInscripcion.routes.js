import {getMediosInscripcion} from "../controllers/medioInscripcion.controllers.js"
import {Router} from "express"

const medioInscripcionRouter = Router();

medioInscripcionRouter.get("/", getMediosInscripcion)

export default medioInscripcionRouter