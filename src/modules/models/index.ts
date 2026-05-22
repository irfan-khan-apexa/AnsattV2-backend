import { SuperMaster } from "./superMasterModel/superMaster.Model";
import { Company } from "./companyModel/company.Model";
import { CompanySettings } from "./companyModel/companySettings.Model";
import { Employee } from "./employeeModel/employee.Model";
import { Department } from "./departmentModel/department.Model";
import { OfferLetter } from "./onboardingModel/offerLetter.Model";
import { Onboarding } from "./onboardingModel/Onboarding.Model";
import { LetterAccessRequest} from "./onboardingModel/LetterAccessRequest.Model";
import { ExitRequest } from "./exitRequestModel/exitRequest.Model";
import { Role } from "./roleModel/role.Model";
import { Policy } from "./policyModel/policyModel";
import {AuditLog} from "./auditModel/auditLog.Model";
import { Leave } from "./leaveModel/leaveModel";
import { LeaveMaster } from "./leaveModel/LeaveMasterModel";
import { LeaveTransaction } from "./leaveModel/LeaveTransactionModel";
import { LeaveActionToken } from "./leaveModel/LeaveActionTokenModel";
import { LeaveExtraField } from "./leaveModel/LeaveExtraFieldModel";
import { FinancialYear } from "./leaveModel/FinancialYearModel";
import { Salary } from "./salaryModel/Salary.Model";
import { Asset } from "./assetModel/Asset.Model";
import { AssetAssign } from "./assetModel/AssetAssign.Model";
import { ExitFeedback } from "./exitRequestModel/exitFeedback.Model";
import { HrAnnouncement } from "./HrAnnouncementModel/HrAnnouncement.Model";
import { JobPosting } from "./recruitmentModel/JobPosting.Model";
import { JobApplication } from "./recruitmentModel/JobApplication.Model";
import { Interview } from "./recruitmentModel/Interview.Model";
import { InterviewFeedback } from "./recruitmentModel/InterviewFeedback.Model";
import { GoalSetting } from "./pmsModel/goalSetting.Model"
import sequelize from "../../config/sequelize";



// Onboarding belongs to Department
// Onboarding.belongsTo(Department, { foreignKey: "department" });

// Onboarding has one Manager (self relation)
// Onboarding.belongsTo(Onboarding, { foreignKey: "reporting_manager", as: "Manager" });


// Employee.hasOne(Onboarding, { foreignKey: "employee_id" });
// Onboarding.belongsTo(Employee, { foreignKey: "employee_id" });

// sequelize.sync({
//   alter: true,
//   logging: console.log, // <-- ye line add karo
// })
// .then(() => {
//   console.log("✅ All models synced with DB");
// })
// .catch((err) => {
//   console.error("❌ Error syncing models:", err);
// });


export {
  SuperMaster,
  Company, CompanySettings,
  Employee,
  Department,
  OfferLetter,
  Role,
  Policy,
  Leave,
  LeaveMaster,
  LeaveTransaction,
  LeaveActionToken,
  LeaveExtraField,
  FinancialYear,
  Onboarding,
  LetterAccessRequest,
  ExitRequest,
  Salary,
  Asset,
  AssetAssign,
  ExitFeedback,
  HrAnnouncement,
  AuditLog,
  JobPosting,JobApplication,Interview,InterviewFeedback,
  GoalSetting
};
