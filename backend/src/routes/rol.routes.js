import {getRoles} from "../controllers/rol.controllers.js";
import {Router} from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const rolRouter = Router();

rolRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']),  getRoles)

export default rolRouter