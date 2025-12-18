import express from "express";
import { getFechasInhabilitadas, postFechasInhabilitadas, deleteFechasInhabilitadas } from "../domains/Inscribcordoba/api/controllers/fechas_inhabilitadas.controller.js";

const router = express.Router();

router.get("/", getFechasInhabilitadas);
router.post("/", postFechasInhabilitadas);
router.delete("/", deleteFechasInhabilitadas);

export default router;