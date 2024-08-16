import {getMediosInscripcion, putMedioInscripcion, postMedioInscripcion, deleteMedioInscripcion} from "../controllers/medioInscripcion.controllers.js"
import {Router} from "express"

const medioInscripcionRouter = Router();

medioInscripcionRouter.get("/", getMediosInscripcion)

medioInscripcionRouter.put("/", putMedioInscripcion)

medioInscripcionRouter.post("/", postMedioInscripcion)

medioInscripcionRouter.delete("/:cod", deleteMedioInscripcion)

export default medioInscripcionRouter