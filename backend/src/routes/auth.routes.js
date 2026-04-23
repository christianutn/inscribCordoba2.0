import { Router } from "express";
import { loginConCidi, logout } from "../domains/Inscribcordoba/api/controllers/auth.controller.js";
import loginLimiter from "../utils/limiter.js";

const authRouter = Router();

// POST /api/auth/cidi — Login vía CiDi (no requiere JWT, es el punto de entrada)
authRouter.post("/cidi", loginLimiter, loginConCidi);

// POST /api/auth/logout — Cierra la sesión borrando la cookie
authRouter.post("/logout", logout);

export default authRouter;
