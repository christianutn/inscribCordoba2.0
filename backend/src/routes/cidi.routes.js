import { Router } from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js";
import { getCuilPorCidi } from "../domains/Inscribcordoba/api/controllers/cidi.controller.js";
const apiCidi = Router();

apiCidi.get(
  "/:cuil",
  passport.authenticate("jwt", { session: false }),
  autorizar(["ADM", "REF", "GA"]),
  getCuilPorCidi
);

export default apiCidi;
