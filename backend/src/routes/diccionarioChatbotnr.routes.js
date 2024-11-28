import { getDiccionarioChatbotnr } from "../controllers/diccionarioChatbotnr.controllers.js";
import { Router } from "express";

const diccionarioChatbotnrRouter = Router();

diccionarioChatbotnrRouter.get("/", getDiccionarioChatbotnr);
console.log("Ruta", diccionarioChatbotnrRouter);
export default diccionarioChatbotnrRouter;
