import { getDiccionarioChatbotnr, insertDiccionarioChatbotnr } from "../controllers/diccionarioChatbotnr.controllers.js";
import { Router } from "express";

const diccionarioChatbotnrRouter = Router();

diccionarioChatbotnrRouter.get("/", getDiccionarioChatbotnr);
diccionarioChatbotnrRouter.post("/", insertDiccionarioChatbotnr);
console.log("Ruta", diccionarioChatbotnrRouter);
export default diccionarioChatbotnrRouter;
