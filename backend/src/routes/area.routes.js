import {getAreas} from "../controllers/area.controllers.js"
import {Router} from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const areaRouter = Router();

areaRouter.get("/", passport.authenticate('jwt', {session:false}), autorizar(["TEST"]), getAreas)



export default areaRouter