import {getTutores} from "../controllers/tutor.controllers.js";
import {Router} from "express";


const tutorRouter = Router();

tutorRouter.get("/", getTutores)


export default tutorRouter