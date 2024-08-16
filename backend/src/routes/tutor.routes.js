import {getTutores, putTutores, postTutor, deleteTutor} from "../controllers/tutor.controllers.js";
import {Router} from "express";
import passport from "passport";


const tutorRouter = Router();

tutorRouter.get("/", passport.authenticate('jwt', {session: false}), getTutores)

tutorRouter.put("/",  putTutores)

tutorRouter.post("/",  postTutor)

tutorRouter.delete("/:cuil",  deleteTutor)


export default tutorRouter