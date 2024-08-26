import {getMinisterios, putMinisterio, deleteMinisterio, postMinisterio} from "../controllers/ministerio.controllers.js"
import {Router} from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const ministerioRouter = Router();


ministerioRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getMinisterios)
ministerioRouter.put("/", putMinisterio)
ministerioRouter.delete("/:cod", deleteMinisterio)
ministerioRouter.post("/", postMinisterio)

export default ministerioRouter

