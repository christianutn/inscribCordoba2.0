import { getDiccionarioChatbot, getDiccionarioChatbotPuntual } from "../controllers/diccionarioChatbot.controllers.js"
import { Router } from "express"


const diccionarioChatbotRouter = Router();

diccionarioChatbotRouter.get("/", getDiccionarioChatbot)
diccionarioChatbotRouter.get("/Puntual", getDiccionarioChatbotPuntual)


export default diccionarioChatbotRouter