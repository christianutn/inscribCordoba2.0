import { Router } from "express";
import {getDatosCronograma, getFechasParaValidar, getObjNroEventos} from "../controllers/googleSheets.controllers.js";
import passport from "passport";
import autorizar from "../utils/autorizar.js"


const googleSheetsRouter = Router();



googleSheetsRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getDatosCronograma)
googleSheetsRouter.get("/matrizFechas", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']),  getFechasParaValidar)
googleSheetsRouter.get("/nroEventos", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']),  getObjNroEventos)


export default googleSheetsRouter
