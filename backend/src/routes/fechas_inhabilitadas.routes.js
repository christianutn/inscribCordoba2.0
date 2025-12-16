import express from "express";
import { getFechasInhabilitadas, postFechasInhabilitadas } from "../domains/Inscribcordoba/api/controllers/fechas_inhabilitadas.controller.js";

const router = express.Router();

router.get("/", getFechasInhabilitadas);
router.post("/", postFechasInhabilitadas);

export default router;