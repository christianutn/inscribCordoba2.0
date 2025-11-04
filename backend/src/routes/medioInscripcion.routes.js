import {getMediosInscripcion, putMedioInscripcion, postMedioInscripcion, deleteMedioInscripcion} from "../domains/Inscribcordoba/api/controllers/medioInscripcion.controllers.js"
import {Router} from "express"
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const medioInscripcionRouter = Router();

medioInscripcionRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getMediosInscripcion)

medioInscripcionRouter.put("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']),putMedioInscripcion)

medioInscripcionRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), postMedioInscripcion)

medioInscripcionRouter.delete("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deleteMedioInscripcion)

export default medioInscripcionRouter