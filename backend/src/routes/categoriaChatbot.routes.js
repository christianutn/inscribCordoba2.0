import {getCategorias} from "../controllers/categoriaChatbot.controllers.js"
import {Router} from "express"


const categoriaChatbotRouter = Router();

categoriaChatbotRouter.get("/",  getCategorias)


export default categoriaChatbotRouter