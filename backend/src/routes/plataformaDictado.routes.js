import {getPlataformasDictado, putPlataformaDictado, postPlataformaDictado, deletePlataformaDictado} from "../domains/Inscribcordoba/api/controllers/plataformaDictado.controllers.js";
import {Router} from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";


const plataformaDictadoRouter = Router();


plataformaDictadoRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getPlataformasDictado)

plataformaDictadoRouter.put("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), putPlataformaDictado)

plataformaDictadoRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM']),  postPlataformaDictado)

plataformaDictadoRouter.delete("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deletePlataformaDictado)


export default plataformaDictadoRouter