import { registrarInscripcionesMasivas } from "../domains/Asistencia/api/controllers/inscripciones.controllers.js";

import { Router } from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"
import upload from "../middlewares/upload.js";


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

export default inscripcionesRouter