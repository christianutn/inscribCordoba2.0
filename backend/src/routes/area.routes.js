import {getAreas} from "../controllers/area.controllers.js"
import {Router} from "express"

const areaRouter = Router();

areaRouter.get("/", getAreas)



export default areaRouter