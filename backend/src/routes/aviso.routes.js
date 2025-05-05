import {postAviso, getAvisos} from "../controllers/aviso.controllers.js";
import { Router } from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"



const avisoRouter = Router();

avisoRouter.get("/",  passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getAvisos)
avisoRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), postAviso)

export default avisoRouter