import { Router } from "express";
import {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getAllPresignedUrls,
  generateOfferLetterById,
  downloadOfferLetter,
  getAllTemplates,
  generateExitLetterById,
  bulkCreateOnboarding
} from "../../controllers/index";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";
import upload from "../../../middlewares/wasabiUpload";

const onboardingRouter = Router();

// onboardingRouter.post(
//   "/Onboarding",
//   authenticateCompanyMaster,
//   createOnboarding
// );

onboardingRouter.get(
  "/Onboarding/templates",
  // authenticateCompanyMaster,
  getAllTemplates
);
onboardingRouter.get(
  "/Onboarding",
  authenticateCompanyMaster,
  getAllOnboardings
);
onboardingRouter.get(
  "/Onboarding/:id",
  authenticateCompanyMaster,
  getOnboardingById
);
onboardingRouter.put(
  "/Onboarding/:id",
  upload.fields([
    { name: "passport_photo", maxCount: 1 },
    { name: "aadhar_photo", maxCount: 1 },
    { name: "pan_photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "offer_letter", maxCount: 1 },
    { name: "joining_letter", maxCount: 1 },
    { name: "experience_letter", maxCount: 1 },
  ]),
  authenticateCompanyMaster,
  updateOnboarding
);
onboardingRouter.delete(
  "/Onboarding/:id",
  authenticateCompanyMaster,
  deleteOnboarding
);

onboardingRouter.post(
  "/Onboarding",
  upload.fields([
    { name: "passport_photo", maxCount: 1 },
    { name: "aadhar_photo", maxCount: 1 },
    { name: "pan_photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "offer_letter", maxCount: 1 },
    { name: "joining_letter", maxCount: 1 },
    { name: "experience_letter", maxCount: 1 },
  ]),
  authenticateCompanyMaster,
  createOnboarding
);

onboardingRouter.get(
  "/Onboarding/:id/presigned-url",
  authenticateCompanyMaster,
  getAllPresignedUrls
);

onboardingRouter.post(
  "/Onboarding/:id/generate-offer-letter",
  authenticateCompanyMaster,
  generateOfferLetterById
);
onboardingRouter.post(
  "/Onboarding/:id/generate-exit-letter",
  authenticateCompanyMaster,
  generateExitLetterById
);
onboardingRouter.get(
  "/Onboarding/:id/offer-letter/download/:format",
  authenticateCompanyMaster,
  downloadOfferLetter
);


onboardingRouter.post("/onboarding/bulk-import", upload.single("file"), bulkCreateOnboarding);

export { onboardingRouter };
