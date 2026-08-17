import { Router, Request, Response } from "express";

import { superMasterRouter } from "./superMasterRoutes/superMaster.Routes";
import { companyRouter } from "./companyRoutes/company.Routes";
import { departmentRouter } from "./departmentRoutes/departmentRoutes";
import { employeeRouter } from "./employeeRoutes/employee.Routes";
import { onboardingRouter } from "./onboardingRoutes/onboarding.Routes";
import { roleRouter } from "./roleRoutes/role.Routes";

import { policyRouter } from "./policyRoutes/policyRoutes";
import { leaveRouter } from "./leaveRoutes/leaveRoutes";
import { exitRouter } from "./exitRequestRoutes/exitRequest.Routes";
import { salaryRouter } from "./salaryRoutes/salary.Routes";
import { assetRouter } from "./assetRoutes/asset.Routes";
import { hrAnnouncementRouter } from "./hrAnnouncementRoutes/hrAnnouncement.Routes";
import { auditRouter } from "./auditRoutes/audit.Routes";
import { jobPostingRouter } from "./recruitmentRoutes/JobPosting.Routes";
import { jobApplicationRouter } from "./recruitmentRoutes/jobApplication.Routes";
import { interviewRouter } from "./recruitmentRoutes/interview.Routes";
import { interviewFeedbackRouter } from "./recruitmentRoutes/interviewFeedback.Routes";
import { goalRouter } from "./pmsRoutes/goalSetting.Routes";
import { customDocumentRouter } from "./customFormBuilderRoutes/customFormBuilder.Routes";
const router = Router();

router.use(superMasterRouter);
router.use(companyRouter);
router.use(departmentRouter);
router.use(employeeRouter);
router.use(onboardingRouter);
router.use(roleRouter);
router.use(policyRouter);
router.use(leaveRouter);
router.use(exitRouter);
router.use(salaryRouter);
router.use(assetRouter);
router.use(hrAnnouncementRouter);
router.use(auditRouter);
router.use(jobPostingRouter);
router.use(jobApplicationRouter);
router.use(interviewRouter);
router.use(interviewFeedbackRouter);
router.use(goalRouter);
router.use(customDocumentRouter);

router.all("/{*any}", (req: Request, res: Response) => {
  res.status(200).json({
    code: 200,
    message: "Bad Request - Url not found",
  });
});

export { router };
