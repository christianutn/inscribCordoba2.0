import { Router } from "express";
import {getDatosCronograma, getFechasParaValidar} from "../controllers/googleSheets.controllers.js";
import passport from "passport";



const googleSheetsRouter = Router();



googleSheetsRouter.get("/", passport.authenticate('jwt', {session: false}), getDatosCronograma)
googleSheetsRouter.get("/matrizFechas",  getFechasParaValidar)


export default googleSheetsRouter
