import {getInstancias, postInstancia, deleteInstancia} from "../controllers/instancia.controllers.js";
import { Router } from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const instanciaRouter = Router();


instanciaRouter.get("/",passport.authenticate('jwt', {session: false}), autorizar(['ADM']), getInstancias)

instanciaRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), postInstancia)

instanciaRouter.delete("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deleteInstancia)



export default instanciaRouter
