import areaRouter from "./area.routes.js";
import ministerioRouter from "./ministerio.routes.js";
import medioInscripcionRouter from "./medioInscripcion.routes.js";
import plataformaDictadoRouter from "./plataformaDictado.routes.js";
import estadoRouter from "./estado.routes.js";
import tipoCapacitacionRouter from "./tipoCapacitacion.routes.js";
import personaRouter from "./persona.routes.js";
import rolRouter from "./rol.routes.js";
import cursoRouter from "./curso.routes.js";
import usuarioRouter from "./usuario.routes.js";
import autorizadorRouter from "./autorizador.routes.js";
import instanciaRouter from "./instancia.routes.js";
import tutorXInstanciaRouter from "./tutorXInstancia.routes.js";
import loginRouter from "./login.routes.js";


import {Router} from "express";


const router = Router();

router.use("/areas", areaRouter);
router.use("/ministerios", ministerioRouter)
router.use("/mediosInscripcion", medioInscripcionRouter)
router.use("/plataformasDictado", plataformaDictadoRouter)
router.use("/estados", estadoRouter)
router.use("/tiposCapacitacion", tipoCapacitacionRouter)
router.use("/personas", personaRouter)
router.use("/roles", rolRouter)
router.use("/cursos", cursoRouter)
router.use("/usuarios", usuarioRouter)
router.use("/autorizadores", autorizadorRouter)
router.use("/instancias", instanciaRouter)
router.use("/tutoresXInstancias", tutorXInstanciaRouter)

router.use("/login", loginRouter)


export default router