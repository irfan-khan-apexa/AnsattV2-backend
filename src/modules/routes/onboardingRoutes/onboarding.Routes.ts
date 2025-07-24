import { Router } from "express";
import {
  createOnboarding,
  getAllOnboardings,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  // uploadDocuments,
  // getDocuments,
  // deleteDocument,
  // generateOfferLetter,
  // generateAppointmentLetter,
  // listAllLetters,
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

// KYC docs – use Wasabi/S3 logic
// onboardingRouter.post(
//   "/:id/upload",
//   authenticateCompanyMaster,
//   uploadDocuments
// );
// onboardingRouter.get("/:id/documents", authenticateCompanyMaster, getDocuments);
// onboardingRouter.delete(
//   "/:id/documents/:docId",
//   authenticateCompanyMaster,
//   deleteDocument
// );

// // Letters
// onboardingRouter.get(
//   "/letters/offer/:id",
//   authenticateCompanyMaster,
//   generateOfferLetter
// );
// onboardingRouter.get(
//   "/letters/appointment/:id",
//   authenticateCompanyMaster,
//   generateAppointmentLetter
// );
// onboardingRouter.get(
//   "/letters/:id/list",
//   authenticateCompanyMaster,
//   listAllLetters
// );

export { onboardingRouter };
