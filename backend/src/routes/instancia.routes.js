import { getInstancias, postInstancia, deleteInstancia } from "../controllers/instancia.controllers.js";
import { Router } from "express";
import autorizar from "../utils/autorizar.js"
import manejerValidacionErrores from "../utils/manejarValidacionErrores.js";
import validarInstancia from "../middlewares/validations/instancia.validations.js";
import passport from "passport";

const instanciaRouter = Router();


instanciaRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), getInstancias)

instanciaRouter.post("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    validarInstancia,
    manejerValidacionErrores,
    postInstancia)

instanciaRouter.delete("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), deleteInstancia)



export default instanciaRouter
