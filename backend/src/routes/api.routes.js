import { Router } from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js";
import {getFeriados} from "../domains/Inscribcordoba/api/controllers/api.controller.js"

const apiArgentinaRouter = Router();

apiArgentinaRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  autorizar(["ADM", "REF", "GA"]),
  getFeriados
);

export default apiArgentinaRouter;
