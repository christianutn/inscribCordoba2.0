import { Router } from "express";
import {getDatosCronograma} from "../controllers/googleSheets.controllers.js";
import passport from "passport";



const googleSheetsRouter = Router();



googleSheetsRouter.get("/", passport.authenticate('jwt', {session: false}), getDatosCronograma)



export default googleSheetsRouter
