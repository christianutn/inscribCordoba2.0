import {postAviso, getAvisos} from "../controllers/aviso.controllers.js";
import { Router } from "express"



const avisoRouter = Router();

avisoRouter.get("/", getAvisos)
avisoRouter.post("/", postAviso)

export default avisoRouter