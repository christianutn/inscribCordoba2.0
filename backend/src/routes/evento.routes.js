import {getEventos, getEventoByCod, postEvento, deleteEvento } from '../controllers/evento.controllers.js';
import { Router } from 'express';
import passport from 'passport';
import autorizar from '../utils/autorizar.js';
import manejarValidacionErrores from "../utils/manejarValidacionErrores.js";
import { check, param, body } from "express-validator";
import AppError from "../utils/appError.js"
import Curso from "../models/curso.models.js"
import Perfil from "../models/perfil.models.js"
import TipoCertificación from "../models/tipoCertificacion.models.js"

const eventoRouter = Router();

eventoRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getEventos);
eventoRouter.get("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getEventoByCod);
eventoRouter.post("/", 
    passport.authenticate('jwt', {session: false}), 
    autorizar(['ADM', 'REF', 'GA']), 
    [
        body("curso")
        .exists().withMessage("El curso debe existir")
        .isString().isLength({ min: 1}).withMessage("El curso debe ser un string")
            .custom(async (value) => {
                const curso = await Curso.findOne({ where: { cod: value } });
                if (!curso) {
                    throw new AppError(`El curso no existe`, 400);
                }
            }),
        body("perfil")
        .exists().withMessage("El curso debe existir")
        .isString().isLength({ min: 1}).withMessage("El curso debe ser un string")
            .custom(async (value) => {
                const perfil = await Perfil.findOne({ where: { cod: value } });
                if (!perfil) {
                    throw new AppError(`El perfil no existe`, 400);
                }
            }),
        body("tipo_certificacion")
        .exists().withMessage("El tipo de certificación debe existir")
        .isString().isLength({ min: 1}).withMessage("El tipo de certificación debe ser un string")
            .custom(async (value) => {
                const perfil = await TipoCertificación.findOne({ where: { cod: value } });
                if (!perfil) {
                    throw new AppError(`El perfil no existe`, 400);
                }
            }),
        body("presentación")
        .exists().withMessage("El campo de presentación debe existir")
        .isString().isLength({min: 1}).withMessage("El campo de presentación debe ser un string"),
        body("objetivos")
        .exists().withMessage("El campo de objetivos debe existir")
        .isString().isLength({min: 1}).withMessage("El campo de objetivos debe ser un string"),
        body("requisitos_aprobacion")
        .exists().withMessage("El campo de requisitos_aprobacion debe existir")
        .isString().isLength({min: 1}).withMessage("El campo de requisitos_aprobacion debe ser un string"),
        body("ejes_tematicos")
        .exists().withMessage("El campo de ejes_tematicos debe existir")
        .isString().isLength({min: 1}).withMessage("El campo de ejes_tematicos debe ser un string"),
        body("certifica_en_cc")
        .exists().withMessage("El campo de certifica_en_cc debe existir")
        .isIn([1, 0]).withMessage("El campo de certifica_en_cc debe existir y ser 1 o 0"),
        body("disenio_a_cargo_cc")
        .exists().withMessage("El campo de disenio_a_cargo_cc debe existir")
        .isIn([1, 0]).withMessage("El campo de disenio_a_cargo_cc debe existir y ser 1 o 0")
    ],
    postEvento);

eventoRouter.delete("/:curso",passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deleteEvento)
export default eventoRouter;