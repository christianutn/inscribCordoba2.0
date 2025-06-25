import { getInstancias, postInstancia, deleteInstancia, get_fechas_invalidas} from "../controllers/instancia.controllers.js";
import { Router } from "express";
import autorizar from "../utils/autorizar.js"
import manejerValidacionErrores from "../utils/manejarValidacionErrores.js";
import validarInstancia from "../middlewares/validations/instancia.validations.js";
import passport from "passport";
import validarFechaPorParametro from "../middlewares/validations/fechaPorParametro.validations.js";

const instanciaRouter = Router();


instanciaRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), getInstancias)

instanciaRouter.post("/",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    validarInstancia,
    manejerValidacionErrores,
    postInstancia)

instanciaRouter.delete("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM']), deleteInstancia)


instanciaRouter.get("/get-fechas-invalidas/:targetYear",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']),
    manejerValidacionErrores,
    get_fechas_invalidas
)

export default instanciaRouter
