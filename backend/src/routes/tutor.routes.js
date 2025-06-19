import {getTutores, putTutores, postTutor, deleteTutor} from "../controllers/tutor.controllers.js";
import {Router} from "express";
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const tutorRouter = Router();

tutorRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']),  getTutores)

tutorRouter.put("/",  passport.authenticate('jwt', {session: false}), autorizar(['ADM']), putTutores)

tutorRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']),  postTutor)

tutorRouter.delete("/:cuil", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deleteTutor)


export default tutorRouter