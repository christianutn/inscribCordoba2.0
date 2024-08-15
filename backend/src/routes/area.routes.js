import {getAreas, putArea} from "../controllers/area.controllers.js"
import {Router} from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const areaRouter = Router();

areaRouter.get("/", passport.authenticate('jwt', {session:false}), getAreas)
areaRouter.put("/",  putArea)



export default areaRouter