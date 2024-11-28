import { getDiccionarioChatbot, getDiccionarioChatbotPuntual, insertDiccionarioChatbot } from "../controllers/diccionarioChatbot.controllers.js"
import { Router } from "express"

const diccionarioChatbotRouter = Router();

diccionarioChatbotRouter.get("/", getDiccionarioChatbot)
diccionarioChatbotRouter.get("/Puntual", getDiccionarioChatbotPuntual)
diccionarioChatbotRouter.post("/", insertDiccionarioChatbot)


export default diccionarioChatbotRouter