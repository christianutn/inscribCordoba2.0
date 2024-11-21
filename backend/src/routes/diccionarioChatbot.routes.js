import {getDiccionarioChatbot} from "../controllers/diccionarioChatbot.controllers.js"
import {Router} from "express"


const diccionarioChatbotRouter = Router();

diccionarioChatbotRouter.get("/",  getDiccionarioChatbot)


export default diccionarioChatbotRouter