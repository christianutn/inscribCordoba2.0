import { getInstancias, postInstancia, deleteInstancia,  supera_cupo_mes, supera_cupo_dia, supera_cantidad_cursos_acumulado, supera_cantidad_cursos_mes, supera_cantidad_cursos_dia, get_fechas_invalidas} from "../controllers/instancia.controllers.js";
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


// Rutas para validar fechas

instanciaRouter.get("/supera-cantidad-cupo-mes/:fechaCursadaDesde", 
    passport.authenticate('jwt', { session: false }), 
    autorizar(['ADM', 'REF', 'GA']), 
    validarFechaPorParametro,
    manejerValidacionErrores,
    supera_cupo_mes
)

instanciaRouter.get("/supera-cantidad-cupo-dia/:fechaCursadaDesde", 
    passport.authenticate('jwt', { session: false }), 
    autorizar(['ADM', 'REF', 'GA']), 
    validarFechaPorParametro,
    manejerValidacionErrores,
    supera_cupo_dia
)

instanciaRouter.get("/supera-cantidad-cursos-acumulado/:fechaCursadaDesde", 
    passport.authenticate('jwt', { session: false }), 
    autorizar(['ADM', 'REF', 'GA']), 
    validarFechaPorParametro,
    manejerValidacionErrores,
    supera_cantidad_cursos_acumulado
)


instanciaRouter.get("/supera-cantidad-cursos-mes/:fechaCursadaDesde", 
    passport.authenticate('jwt', { session: false }), 
    autorizar(['ADM', 'REF', 'GA']), 
    validarFechaPorParametro,
    manejerValidacionErrores,
    supera_cantidad_cursos_mes
)


instanciaRouter.get("/supera-cantidad-cursos-dia/:fechaCursadaDesde", 
    passport.authenticate('jwt', { session: false }), 
    autorizar(['ADM', 'REF', 'GA']), 
    validarFechaPorParametro,
    manejerValidacionErrores,
    supera_cantidad_cursos_dia
)


instanciaRouter.get("/get-fechas-invalidas/:targetYear",
    get_fechas_invalidas
)

export default instanciaRouter
