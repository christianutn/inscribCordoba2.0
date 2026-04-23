import { Router } from "express";
import { loginConCidi } from "../domains/Inscribcordoba/api/controllers/auth.controller.js";
import loginLimiter from "../utils/limiter.js";

const authRouter = Router();

// POST /api/auth/cidi — Login vía CiDi (no requiere JWT, es el punto de entrada)
authRouter.post("/cidi", loginLimiter, loginConCidi);

export default authRouter;
