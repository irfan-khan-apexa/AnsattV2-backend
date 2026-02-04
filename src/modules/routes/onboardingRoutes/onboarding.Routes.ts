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
  bulkCreateOnboarding,
  employeeLogin,
  requestLetterAccess,getCompanyLetterRequests,getEmployeeLetterRequests,downloadLetter,actionLetterRequest
} from "../../controllers/index";
import { authenticateUser, authenticateEmployee } from "../../../middlewares/authMiddleware";
import upload from "../../../middlewares/wasabiUpload";

const onboardingRouter = Router();

// onboardingRouter.post(
//   "/Onboarding",
//   authenticateUser,
//   createOnboarding
// );

onboardingRouter.get(
  "/Onboarding/templates",
  // authenticateUser,
  getAllTemplates
);
onboardingRouter.get(
  "/Onboarding",
  authenticateUser,
  getAllOnboardings
);
onboardingRouter.get(
  "/Onboarding/:id",
  authenticateUser,
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
  authenticateUser,
  updateOnboarding
);
onboardingRouter.delete(
  "/Onboarding/:id",
  authenticateUser,
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
  authenticateUser,
  createOnboarding
);

onboardingRouter.get(
  "/Onboarding/:id/presigned-url",
  authenticateUser,
  getAllPresignedUrls
);

onboardingRouter.post(
  "/Onboarding/:id/generate-offer-letter",
  authenticateUser,
  generateOfferLetterById
);
onboardingRouter.post(
  "/Onboarding/:id/generate-exit-letter",
  authenticateUser,
  generateExitLetterById
);
onboardingRouter.get(
  "/Onboarding/:id/offer-letter/download/:format",
  authenticateUser,
  downloadOfferLetter
);


onboardingRouter.post("/onboarding/bulk-import", upload.single("file"), bulkCreateOnboarding);

onboardingRouter.post("/requestLetterAccess", authenticateUser, requestLetterAccess);
onboardingRouter.get("/getemployeerequest", authenticateUser, getEmployeeLetterRequests);
onboardingRouter.get("/getallrequest", authenticateUser, getCompanyLetterRequests);
onboardingRouter.post("/hr/letter/request/:id/action", authenticateUser, actionLetterRequest);
// onboardingRouter.get("/letter/download/:letter_type", authenticateUser, downloadLetter);
onboardingRouter.get(
  "/letter/download/:letter_type/:format",
  authenticateUser,
  downloadLetter
);
onboardingRouter.post("/employee-login", employeeLogin);



export { onboardingRouter };
