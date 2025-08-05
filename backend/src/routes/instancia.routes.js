import { getInstancias, postInstancia, deleteInstancia, get_fechas_invalidas, putInstancia} from "../controllers/instancia.controllers.js";
import { Router } from "express";
import autorizar from "../utils/autorizar.js"
import manejerValidacionErrores from "../utils/manejarValidacionErrores.js";
import validarInstancia from "../middlewares/validations/instancia.validations.js";
import passport from "passport";

const instanciaRouter = Router();


instanciaRouter.get("/", passport.authenticate('jwt', { session: false }), autorizar(['ADM', 'GA', 'REF']), getInstancias)

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

instanciaRouter.put("/:curso_params/:fecha_inicio_curso_params",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM']),

    putInstancia
)

export default instanciaRouter
