import { Router } from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
addNewCategory, getLeaveCategory,updateLeaveCategory, deleteLeavecategory,
    addExtraField,getExtraFields, getExtraFieldById,renameExtraField, deleteExtraField,getLeaveBalance,
    getAllEmployeesLeaveBalance,setFinancialYear,getFinancialYear,deleteFinancialYear
} from "../../controllers/index";
import { authenticateEmployee } from "../../../middlewares/authMiddleware";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const leaveRouter = Router();

// Employee Routes
leaveRouter.post("/leaves", authenticateEmployee, applyLeave);
leaveRouter.get("/leaves/mine", authenticateEmployee, getMyLeaves);

// Company Master Routes
leaveRouter.get("/leaves", authenticateCompanyMaster, getAllLeaves);
leaveRouter.put("/leaves/approve/:id", authenticateCompanyMaster, approveLeave);
leaveRouter.put("/leaves/reject/:id", authenticateCompanyMaster, rejectLeave);

// Company Master Routes (Leave Master Config)
leaveRouter.post("/leave-category", authenticateCompanyMaster, addNewCategory);
leaveRouter.get("/leave-category", authenticateCompanyMaster, getLeaveCategory);
leaveRouter.get("/leave-category/for-employee", authenticateEmployee, getLeaveCategory);
leaveRouter.put("/leave-category/rename/:id", authenticateCompanyMaster, updateLeaveCategory);
leaveRouter.delete("/leave-category/delete/:id", authenticateCompanyMaster, deleteLeavecategory);


// Extra Field Routes
leaveRouter.post("/extra-fields", authenticateCompanyMaster, addExtraField);
leaveRouter.get("/extra-fields", authenticateCompanyMaster, getExtraFields);
leaveRouter.get("/extra-fields/for-employee", authenticateEmployee, getExtraFields);
leaveRouter.get("/extra-fields/:id", authenticateCompanyMaster, getExtraFieldById);
leaveRouter.put("/extra-fields/:id", authenticateCompanyMaster, renameExtraField);
leaveRouter.delete("/extra-fields/:id", authenticateCompanyMaster, deleteExtraField);

// leave balance
leaveRouter.get("/leaves/balance",authenticateEmployee, getLeaveBalance);
leaveRouter.get("/leaves/balance/all",authenticateEmployee, getAllEmployeesLeaveBalance);

//financial year
leaveRouter.post("/financial-year",authenticateCompanyMaster,setFinancialYear );
leaveRouter.get("/financial-year",authenticateCompanyMaster, getFinancialYear);
leaveRouter.delete("/financial-year",authenticateCompanyMaster, deleteFinancialYear);



export { leaveRouter };
