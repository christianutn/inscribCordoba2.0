
import  {Router} from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";
import {getPerfiles, getPerfilByCod} from "../controllers/perfil.controllers.js"


const perfilRouter = Router();

perfilRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getPerfiles)
perfilRouter.get("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getPerfilByCod)
export default perfilRouter