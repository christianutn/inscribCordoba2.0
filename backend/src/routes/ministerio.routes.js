import {getMinisterios, putMinisterio, deleteMinisterio, postMinisterio} from "../controllers/ministerio.controllers.js"
import {Router} from "express"
import passport from "passport";

const ministerioRouter = Router();


ministerioRouter.get("/", passport.authenticate('jwt', {session: false}),  getMinisterios)
ministerioRouter.put("/", putMinisterio)
ministerioRouter.delete("/:cod", deleteMinisterio)
ministerioRouter.post("/", postMinisterio)

export default ministerioRouter

