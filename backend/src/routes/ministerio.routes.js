import {getMinisterios} from "../controllers/ministerio.controllers.js"
import {Router} from "express"

const ministerioRouter = Router();


ministerioRouter.get("/", getMinisterios)


export default ministerioRouter

