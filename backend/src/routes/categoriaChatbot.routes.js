import { getCategorias, insertCategoria } from "../controllers/categoriaChatbot.controllers.js"
import { Router } from "express"


const categoriaChatbotRouter = Router();

categoriaChatbotRouter.get("/", getCategorias)
categoriaChatbotRouter.post("/", insertCategoria)

export default categoriaChatbotRouter