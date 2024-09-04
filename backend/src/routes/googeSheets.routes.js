import { Router } from "express";
import {getDatosCronograma, getFechasParaValidar} from "../controllers/googleSheets.controllers.js";
import passport from "passport";
import autorizar from "../utils/autorizar.js"


const googleSheetsRouter = Router();



googleSheetsRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']), getDatosCronograma)
googleSheetsRouter.get("/matrizFechas", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF']),  getFechasParaValidar)


export default googleSheetsRouter
