import {getMinisterioXAreaXCurso} from "../controllers/ministerioXAreaXCurso.controllers.js";
import { Router } from "express";

const ministerioXAreaXCursoRouter = Router();

ministerioXAreaXCursoRouter.get("/", getMinisterioXAreaXCurso)


export default ministerioXAreaXCursoRouter