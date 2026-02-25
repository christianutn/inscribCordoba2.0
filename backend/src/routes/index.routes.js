import areaRouter from "./area.routes.js";
import ministerioRouter from "./ministerio.routes.js";
import medioInscripcionRouter from "./medioInscripcion.routes.js";
import plataformaDictadoRouter from "./plataformaDictado.routes.js";

import tipoCapacitacionRouter from "./tipoCapacitacion.routes.js";
import personaRouter from "./persona.routes.js";
import rolRouter from "./rol.routes.js";
import cursoRouter from "./curso.routes.js";
import usuarioRouter from "./usuario.routes.js";
import autorizadorRouter from "./autorizador.routes.js";
import instanciaRouter from "./instancia.routes.js";
import tutorXInstanciaRouter from "./tutorXInstancia.routes.js";
import loginRouter from "./login.routes.js";
import tutorRouter from "./tutor.routes.js";
import rolesTutorRouter from "./rolesTutor.routes.js";

import restriccionesFechasInicioCursada from "./restriccionesFechasInicioCursada.routes.js";
import perfilRouter from "./perfil.routes.js";
import AreaTematica from "./areaTematica.routes.js";
import tipoCertificacionRouter from "./tipoCertificacion.routes.js";
import eventoRouter from "./evento.routes.js";
import { Router } from "express";
import AvisoRouter from "./aviso.routes.js"
import ApiArgentinaFeriadosRouter from "./api.routes.js";
import AreasAsignadasUsuario from "./areasAsignadasUsuario.routes.js";
import EstadosInstanciaRouter from "./estadosInstancia.routes.js";
import DepartamentoRouter from "./departamento.routes.js"
import NotasAutorizacionRouter from "../domains/Inscribcordoba/api/routes/notas_autorizacion.routes.js"
import AsistenciaRouter from "./asistencia.routes.js";
import CambiosEstadosNotasDeAutorizacionRouter from "../domains/Inscribcordoba/api/routes/cambios_estados_notas_de_autorizacion.routes.js";
import CoordinadorRouter from "./coordinador.routes.js";
import HistoricoTutoresEnCursoRouter from "../domains/Inscribcordoba/api/routes/historico_tutores_en_cursos.routes.js";

import FechasInhabilitadasRouter from "./fechas_inhabilitadas.routes.js";
import FechasInhabilitadasFinRouter from "./fechas_inhabilitadas_fin.routes.js";


const router = Router();

router.use("/areas", areaRouter);
router.use("/ministerios", ministerioRouter)
router.use("/mediosInscripcion", medioInscripcionRouter)
router.use("/plataformasDictado", plataformaDictadoRouter)

router.use("/tiposCapacitacion", tipoCapacitacionRouter)
router.use("/personas", personaRouter)
router.use("/roles", rolRouter)
router.use("/cursos", cursoRouter)
router.use("/usuarios", usuarioRouter)
router.use("/autorizadores", autorizadorRouter)
router.use("/instancias", instanciaRouter)
router.use("/tutoresXInstancias", tutorXInstanciaRouter)
router.use("/login", loginRouter)
router.use("/tutores", tutorRouter)
router.use("/rolesTutor", rolesTutorRouter)
router.use("/restricciones", restriccionesFechasInicioCursada)
router.use("/perfiles", perfilRouter)
router.use("/areasTematicas", AreaTematica)
router.use("/tiposCertificaciones", tipoCertificacionRouter)
router.use("/eventos", eventoRouter)
router.use("/avisos", AvisoRouter)
router.use("/argentina/feriados", ApiArgentinaFeriadosRouter)
router.use("/areasAsignadasUsuario", AreasAsignadasUsuario)
router.use("/estadosInstancia", EstadosInstanciaRouter)
router.use("/departamentos", DepartamentoRouter)
router.use("/notas-autorizacion", NotasAutorizacionRouter)
router.use("/cambios-estados-notas-autorizacion", CambiosEstadosNotasDeAutorizacionRouter)
router.use("/coordinadores", CoordinadorRouter)
router.use("/historico-tutores-en-cursos", HistoricoTutoresEnCursoRouter)
router.use("/fechas-inhabilitadas", FechasInhabilitadasRouter)
router.use("/fechas-inhabilitadas-fin", FechasInhabilitadasFinRouter)
router.use("/asistencias", AsistenciaRouter)


export default router