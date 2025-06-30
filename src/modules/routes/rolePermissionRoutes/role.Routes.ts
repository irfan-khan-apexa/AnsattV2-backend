import { Router } from "express";
import { createRole } from "../../controllers/index";

const roleRouter = Router();

roleRouter.post("/roles", createRole);

export { roleRouter };
