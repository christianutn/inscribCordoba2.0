import { getInstancias, postInstancia, deleteInstancia,  supera_cupo_mes, supera_cupo_dia, supera_cantidad_cursos_acumulado, supera_cantidad_cursos_mes, supera_cantidad_cursos_dia, obtenerFechasInvalidasPorMes } from "../controllers/instancia.controllers.js";
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


// Nueva ruta para obtener fechas inválidas por mes (acumulado)
instanciaRouter.get("/obtenerFechasInvalidasPorMes",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']), // Asumiendo misma autorización que otras rutas de validación GET
    // No hay middleware de validación específico aquí por ahora; el controlador validará los parámetros de consulta.
    manejerValidacionErrores, // Manejador de errores de validación estándar
    obtenerFechasInvalidasPorMes // Nueva función del controlador
);

export default instanciaRouter
