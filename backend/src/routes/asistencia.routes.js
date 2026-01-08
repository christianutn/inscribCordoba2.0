import { registrarInscripcionesMasivas } from "../domains/Asistencia/api/controllers/inscripciones.controllers.js";
import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import upload from "../middlewares/upload.js";

import AsistenciasCursosRouter from "../domains/Asistencia/api/routes/cursos.routes.js";
import EventosRouter from "../domains/Asistencia/api/routes/eventos.routes.js";
import NotasRouter from "../domains/Asistencia/api/routes/nota.routes.js";
import AsistenciaQrRouter from "../domains/Asistencia/api/routes/asistencia.routes.js";


const inscripcionesRouter = Router();


// 1. Se cambia el método a POST, ya que se enviará un archivo en el cuerpo de la petición.
// 2. Se añade el middleware de autenticación (passport) y autorización (autorizar).
// 3. Se añade el middleware 'upload.single('archivo')'. Esto le dice a multer que espere
//    un único archivo en un campo del formulario llamado 'archivo'.
inscripcionesRouter.post("/inscripciones/cargas-masivas",
    passport.authenticate('jwt', { session: false }),
    autorizar(['ADM', 'REF', 'GA']), // O los roles que correspondan
    upload.single('excelFile'),
    registrarInscripcionesMasivas)

inscripcionesRouter.use("/cursos", AsistenciasCursosRouter);
inscripcionesRouter.use("/eventos", EventosRouter);
inscripcionesRouter.use("/notas", NotasRouter);
inscripcionesRouter.use("/", AsistenciaQrRouter);



export default inscripcionesRouter