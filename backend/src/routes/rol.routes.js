import {getRoles} from "../controllers/rol.controllers.js";
import {Router} from "express"

const rolRouter = Router();

rolRouter.get("/", getRoles)

export default rolRouter