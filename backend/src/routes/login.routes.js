import {postLogin} from "../controllers/login.controllers.js"
import {Router} from "express"
import passport from "passport";
import loginLimiter from "../utils/limiter.js"

const loginRouter = Router();

console.log("Se ejecuta el /login")

loginRouter.post("/", loginLimiter, passport.authenticate('login', {session: false}), postLogin)


export default loginRouter