import { Router } from "express";
import { createModule } from "../../controllers/index";

const moduleRouter = Router();

moduleRouter.post("/modules", createModule);

export { moduleRouter };
