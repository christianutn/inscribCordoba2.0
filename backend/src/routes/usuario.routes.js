
import {getUsuario, postUsuario} from "../controllers/usuario.controllers.js";
import {Router} from "express";
import passport from "passport";

const usuarioRouter = Router();


usuarioRouter.get("/", getUsuario)

usuarioRouter.post("/registrar", passport.authenticate('registrar', {session: false}), (req, res, next) => {
    try {
        if(!req.user){
            res.status(400).json(req.user)
        }
        res.status(200).json(req.user)
    } catch (error) {
        next(error)
    }
});


export default usuarioRouter

