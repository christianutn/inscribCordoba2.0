import {getTutores} from "../controllers/tutor.controllers.js";
import {Router} from "express";
import passport from "passport";


const tutorRouter = Router();

tutorRouter.get("/", passport.authenticate('jwt', {session: false}), getTutores)


export default tutorRouter