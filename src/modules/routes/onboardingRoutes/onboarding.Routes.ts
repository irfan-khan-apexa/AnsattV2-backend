import { Router } from "express";
import { createOfferLetter } from "../../controllers/index";
import {
  authenticateSuperMaster,
  authenticateCompanyMaster,
  // authenticateRole,
} from "../../../middlewares/authMiddleware";

const onboardingRouter = Router();

onboardingRouter.post(
  "/offer-letter",
  authenticateCompanyMaster,
  createOfferLetter
);

export { onboardingRouter };
