import { Router } from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  handleLeaveAction,
  approveLeave,
  rejectLeave,
addNewCategory, getLeaveCategory,updateLeaveCategory, deleteLeavecategory,
    addExtraField,getExtraFields, getExtraFieldById,renameExtraField, deleteExtraField,getLeaveBalance,
    getAllEmployeesLeaveBalance,setFinancialYear,getFinancialYear,getAllFinancialYears,deleteFinancialYear
} from "../../controllers/index";
import { authenticateEmployee ,authenticateUser} from "../../../middlewares/authMiddleware";
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const leaveRouter = Router();

// Employee Routes
leaveRouter.post("/leaves", authenticateUser, applyLeave);
leaveRouter.get("/leaves/mine", authenticateUser, getMyLeaves);

// Company Master Routes
leaveRouter.get("/leaves", authenticateUser, getAllLeaves);
leaveRouter.get("/leaves/action", handleLeaveAction);
leaveRouter.put("/leaves/approve/:id", authenticateUser, approveLeave);
leaveRouter.put("/leaves/reject/:id", authenticateUser, rejectLeave);

// Company Master Routes (Leave Master Config)
leaveRouter.post("/leave-category", authenticateUser, addNewCategory);
leaveRouter.get("/leave-category", authenticateUser, getLeaveCategory);
leaveRouter.get("/leave-category/for-employee", authenticateUser, getLeaveCategory);
leaveRouter.put("/leave-category/rename/:id", authenticateUser, updateLeaveCategory);
leaveRouter.delete("/leave-category/delete/:id", authenticateUser, deleteLeavecategory);


// Extra Field Routes
leaveRouter.post("/extra-fields", authenticateUser, addExtraField);
leaveRouter.get("/extra-fields", authenticateUser, getExtraFields);
leaveRouter.get("/extra-fields/for-employee", authenticateUser, getExtraFields);
leaveRouter.get("/extra-fields/:id", authenticateUser, getExtraFieldById);
leaveRouter.put("/extra-fields/:id", authenticateUser, renameExtraField);
leaveRouter.delete("/extra-fields/:id", authenticateUser, deleteExtraField);

// leave balance
leaveRouter.get("/leaves/balance",authenticateUser, getLeaveBalance);
leaveRouter.get("/leaves/balance/all",authenticateUser, getAllEmployeesLeaveBalance);

//financial year
leaveRouter.post("/financial-year",authenticateUser,setFinancialYear );
leaveRouter.get("/financial-year",authenticateUser, getFinancialYear);
leaveRouter.get("/all-financial-year",authenticateUser, getAllFinancialYears);
leaveRouter.delete("/financial-year",authenticateUser, deleteFinancialYear);



export { leaveRouter };
