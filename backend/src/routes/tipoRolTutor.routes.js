import {getTipoRolTutor} from "../controllers/tipo_rol_tutor.controllers.js";
import {Router} from "express";


const tipoRolTutorRouter = Router();


tipoRolTutorRouter.get("/", getTipoRolTutor)

export default tipoRolTutorRouter