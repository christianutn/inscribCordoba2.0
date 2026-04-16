import { Router } from "express";
import passport from "passport";
import autorizar from "../../../utils/autorizar.js";
import { getNotasDeAutorizacion, registrarNotaDeAutorizacion, autorizarNotaDeAutorizacion } from "../domains/Inscribcordoba/api/controllers/notasAutorizacion.controller.js";
import ManejadorArchivos from "../../../services/ManejadorDeArchivo.js";

const manejadorArchivos = new ManejadorArchivos("nota_autorizacion");

const notasAutorizacionRouter = Router();

console.log("Si se usaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

notasAutorizacionRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  autorizar(["ADM", "REF", "GA"]),
  manejadorArchivos.middleware(),
  registrarNotaDeAutorizacion
);

notasAutorizacionRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  autorizar(["ADM", "REF", "GA"]),
  autorizarNotaDeAutorizacion
);

export default notasAutorizacionRouter;
