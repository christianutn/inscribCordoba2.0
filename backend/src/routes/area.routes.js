import {getAreas, putArea, postArea, deleteArea} from "../controllers/area.controllers.js"
import {Router} from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const areaRouter = Router();

areaRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getAreas)
areaRouter.put("/",  passport.authenticate('jwt', {session: false}), autorizar(['ADM']),putArea)
areaRouter.post("/",  passport.authenticate('jwt', {session: false}), autorizar(['ADM']), postArea)
areaRouter.delete("/:cod",  passport.authenticate('jwt', {session: false}), autorizar(['ADM']),deleteArea)



export default areaRouter