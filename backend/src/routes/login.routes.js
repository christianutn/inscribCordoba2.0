import {postLogin} from "../controllers/login.controllers.js"
import {Router} from "express"
import passport from "passport";

const loginRouter = Router();


loginRouter.post("/", passport.authenticate('login', {session: false}), postLogin)


export default loginRouter