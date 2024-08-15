import {getMinisterios, putMinisterio} from "../controllers/ministerio.controllers.js"
import {Router} from "express"
import passport from "passport";

const ministerioRouter = Router();


ministerioRouter.get("/", passport.authenticate('jwt', {session: false}),  getMinisterios)
ministerioRouter.put("/", putMinisterio)

export default ministerioRouter

