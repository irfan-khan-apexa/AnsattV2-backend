import { Request, Response } from "express";
import { Leave ,LeaveMaster,LeaveTransaction,LeaveExtraField,FinancialYear,Onboarding} from "../../models";
import { Op } from "sequelize";
import { calculateLeaveBalance } from "../../../utils/leaveUtils";
import { sendMail } from "../../../utils/mailer";



//  Apply for Leave (Employee)
// controllers/leaveController.ts

// Apply Leave (Employee)
// const applyLeave = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const employeeId = (req as any).user.id;
//     const companyCode = (req as any).user.company_code; // ✅ fix

//     const { category, startDate, endDate, reason, noOfDays, document, extraFieldValues } = req.body;

//     if (!category || !startDate || !endDate || !reason) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const metaFields = await LeaveExtraField.findAll({ where: { companyCode } });

//     const mappedExtraFields: any = {};
//     metaFields.forEach(f => {
//       mappedExtraFields[f.name] = extraFieldValues?.[f.name] ?? "";
//     });

//     const calculatedDays = noOfDays ?? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

//     const leave = await LeaveTransaction.create({
//       employeeId,
//       category,
//       startDate,
//       endDate,
//       noOfDays: calculatedDays,
//       reason,
//       status: "Pending",
//       document: document || null,
//       extraFields: mappedExtraFields,
//     });

//     res.status(201).json({ message: "Leave applied", leave });
//   } catch (err) {
//     console.error("Error applying leave:", err);
//     res.status(500).json({ message: "Error applying leave" });
//   }
// };

// Get My Leaves (Employee)
const getMyLeaves = async (req: Request, res: Response): Promise<any> => {
  try {
    const employeeId = (req as any).user.id;

    const leaves = await LeaveTransaction.findAll({
      where: { employeeId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ total: leaves.length, leaves });
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ message: "Error fetching leaves" });
  }
};



// ✅ Get All Leaves (HR/Manager)
const getAllLeaves = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = "1", limit = "10", search, status, category, start, end } = req.query;

    const whereClause: any = {};

    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (search) whereClause.reason = { [Op.like]: `%${search}%` };
    if (start && end) whereClause.startDate = { [Op.between]: [start, end] };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { rows: leaves, count: total } = await LeaveTransaction.findAndCountAll({
      where: whereClause,
      offset,
      limit: limitNum,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ total, page: pageNum, pageSize: limitNum, leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// ✅ Approve Leave
// const approveLeave = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const leave = await LeaveTransaction.findByPk(req.params.id);
//     if (!leave) return res.status(404).json({ message: "Leave not found" });

//     leave.status = "Approved";
//     await leave.save();

//     res.status(200).json({ message: "Leave approved", leave });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error approving leave" });
//   }
// };

// ✅ Reject Leave
// const rejectLeave = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const leave = await LeaveTransaction.findByPk(req.params.id);
//     if (!leave) return res.status(404).json({ message: "Leave not found" });

//     leave.status = "Rejected";
//     await leave.save();

//     res.status(200).json({ message: "Leave rejected", leave });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error rejecting leave" });
//   }
// };

const applyLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const employeeId = (req as any).user.id;
    const companyCode = (req as any).user.company_code;

    const { category, startDate, endDate, reason, noOfDays, document, extraFieldValues } = req.body;

    if (!category || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ employee fetch karo for name
    const employee = await Onboarding.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const metaFields = await LeaveExtraField.findAll({ where: { companyCode } });
    const mappedExtraFields: any = {};
    metaFields.forEach(f => {
      mappedExtraFields[f.name] = extraFieldValues?.[f.name] ?? "";
    });

    const calculatedDays =
      noOfDays ??
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const leave = await LeaveTransaction.create({
      employeeId,
      employeeName: employee.name,   // ✅ store employee name also
      category,
      startDate,
      endDate,
      noOfDays: calculatedDays,
      reason,
      status: "Pending",
      document: document || null,
      extraFields: mappedExtraFields,
    });

    // 👇 Email to HR/Manager
   await sendMail(
  ["yamib619@gmail.com", "golurj050@gmail.com"],
  "New Leave Request Submitted",
  `
  <div style="font-family: Arial, sans-serif; font-size:14px; color:#333; line-height:1.6;">
    <h2 style="color:#2c3e50;"> New Leave Application</h2>
    <p>Dear HR/Manager,</p>
    <p>A new leave request has been submitted by <b>${employee?.name}</b> (Employee ID: <b>${employeeId}</b>).</p>
    
    <table style="border-collapse:collapse; width:100%; margin-top:15px;">
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>Employee Name</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${employee?.name}</td>
      </tr>
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>Employee ID</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${employeeId}</td>
      </tr>
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>Department</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${employee?.department || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>Leave Category</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${category}</td>
      </tr>
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>Start Date</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${startDate}</td>
      </tr>
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>End Date</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${endDate}</td>
      </tr>
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>Total Days</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${calculatedDays}</td>
      </tr>
      <tr>
        <td style="padding:8px; border:1px solid #ddd;"><b>Reason</b></td>
        <td style="padding:8px; border:1px solid #ddd;">${reason}</td>
      </tr>
    </table>

    <p style="margin-top:20px;">
      Please take the necessary action by clicking one of the options below:
    </p>

    <div style="margin-top:15px;">
      <a href="https://your-frontend.com/leaves/approve/${leave.id}" 
        style="background:#28a745; color:#fff; padding:10px 18px; text-decoration:none; border-radius:5px; margin-right:10px;">
         Approve
      </a>
      <a href="https://your-frontend.com/leaves/reject/${leave.id}" 
        style="background:#dc3545; color:#fff; padding:10px 18px; text-decoration:none; border-radius:5px;">
         Reject
      </a>
    </div>

    <p style="margin-top:30px;">Regards,<br><b>Leave Management System</b></p>
  </div>
  `
);


    res.status(201).json({ message: "Leave applied", leave });
  } catch (err) {
    console.error("Error applying leave:", err);
    res.status(500).json({ message: "Error applying leave" });
  }
};


// ✅ Approve Leave
const approveLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const leave = await LeaveTransaction.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "Approved";
    await leave.save();

    // 👇 Send mail to employee
    const employee = await Onboarding.findByPk(leave.employeeId);
    if (employee?.email) {
      await sendMail(
        employee.email,
        "Leave Approved",
        `<p>Your leave request from ${leave.startDate} to ${leave.endDate} has been <b>approved</b>.</p>`
      );
    }

    res.status(200).json({ message: "Leave approved", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving leave" });
  }
};

// ✅ Reject Leave
const rejectLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const leave = await LeaveTransaction.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "Rejected";
    await leave.save();

    // 👇 Send mail to employee
    const employee = await Onboarding.findByPk(leave.employeeId);
    if (employee?.email) {
      await sendMail(
        employee.email,
        "Leave Rejected",
        `<p>Your leave request from ${leave.startDate} to ${leave.endDate} has been <b>rejected</b>.</p>`
      );
    }

    res.status(200).json({ message: "Leave rejected", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting leave" });
  }
};



///////////

// ✅ Add / Update Leave Master Config
// Create / Update Leave Master
// ✅ Create / Update Leave Master (type + name ke base par unique)
const addNewCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code; // token se
    const { type, name, allowedLeaves } = req.body;

    if (!type || !name) {
      return res.status(400).json({ message: "Type and Name are required" });
    }

    // Duplicate check by company + name
    const existing = await LeaveMaster.findOne({
      where: { companyCode, name },
    });

    if (existing) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const record = await LeaveMaster.create({
      companyCode,
      type,
      name,
      allowedLeaves: allowedLeaves || 0,
    });

    res.status(201).json({
      message: "Category created successfully",
      data: record,
    });
  } catch (err) {
    console.error("Error in addNewCategory:", err);
    res.status(500).json({ message: "Error creating category" });
  }
};


// ✅ Get Categories by type (optional filter)
// const getLeaveCategory = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { type } = req.query;
//     const companyCode = (req as any).user.company_code;

//     const whereClause: any = { companyCode };
//     if (type) whereClause.type = type;

//     const records = await LeaveMaster.findAll({ where: whereClause });

//     res.status(200).json(records);
//   } catch (err) {
//     console.error("Error in getLeaveCategory:", err);
//     res.status(500).json({ message: "Error fetching categories" });
//   }
// };
// ✅ Leave Category
const getLeaveCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { type } = req.query;
    const user = (req as any).user;

    if (!user?.company_code) {
      return res.status(401).json({ message: "Invalid token: company_code missing" });
    }

    const whereClause: any = { companyCode: user.company_code };

    if (type) whereClause.type = type;

    const records = await LeaveMaster.findAll({ where: whereClause });
    res.status(200).json(records);
  } catch (err) {
    console.error("Error in getLeaveCategory:", err);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// ✅ Rename/Update Category Name
const updateLeaveCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { newName, newType, allowedLeaves } = req.body;
    const companyCode = (req as any).user.company_code;

    const record = await LeaveMaster.findOne({ where: { id, companyCode } });

    if (!record) return res.status(404).json({ message: "Category not found" });

    // ✅ check duplicate name (ignore current id)
    if (newName) {
      const duplicate = await LeaveMaster.findOne({
        where: { companyCode, name: newName, id: { [Op.ne]: id } },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Category name already exists" });
      }
      record.name = newName;
    }

    if (newType) record.type = newType;
    if (allowedLeaves !== undefined) record.allowedLeaves = allowedLeaves;

    await record.save();

    res.status(200).json({
      message: "Category updated successfully",
      data: record,
    });
  } catch (err) {
    console.error("Error in updateLeaveCategory:", err);
    res.status(500).json({ message: "Error updating category" });
  }
};


// ✅ Delete Category
const deleteLeavecategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code;
    const record = await LeaveMaster.findOne({
      where: { id: req.params.id, companyCode },
    });

    if (!record) return res.status(404).json({ message: "Category not found" });

    await record.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error in deleteLeavecategory:", err);
    res.status(500).json({ message: "Error deleting category" });
  }
};





// Add/Update Extra Fields


const addExtraField = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name } = req.body;
    const companyCode = (req as any).user.company_code; // FIXED

    if (!name) return res.status(400).json({ message: "Field name is required" });
    if (!companyCode) return res.status(400).json({ message: "Company code missing from token" });

    const exists = await LeaveExtraField.findOne({ where: { companyCode, name } });
    if (exists) return res.status(400).json({ message: "Field already exists" });

    const field = await LeaveExtraField.create({ companyCode, name });
    res.status(201).json({ message: "Field added", field });
  } catch (err) {
    console.error("Error in addExtraField:", err);
    res.status(500).json({ message: "Error adding field" });
  }
};

// const getExtraFields = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const companyCode = (req as any).user.company_code; //  FIXED
//     const fields = await LeaveExtraField.findAll({ where: { companyCode } });
//     res.status(200).json({ fields });
//   } catch (err) {
//     console.error("Error in getExtraFields:", err);
//     res.status(500).json({ message: "Error fetching fields" });
//   }
// };
const getExtraFields = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;

    if (!user?.company_code) {
      return res.status(401).json({ message: "Invalid token: company_code missing" });
    }

    const fields = await LeaveExtraField.findAll({ where: { companyCode: user.company_code } });
    res.status(200).json({ fields });
  } catch (err) {
    console.error("Error in getExtraFields:", err);
    res.status(500).json({ message: "Error fetching fields" });
  }
};

// Get by ID
 const getExtraFieldById = async (req: Request, res: Response): Promise<any>  => {
  try {
    const field = await LeaveExtraField.findByPk(req.params.id);
    if (!field) return res.status(404).json({ message: "Field not found" });
    res.status(200).json({ field });
  } catch (err) {
    res.status(500).json({ message: "Error fetching field" });
  }
};

// Rename by ID
const renameExtraField = async (req: Request, res: Response): Promise<any> => {
  try {
    const { newName } = req.body; 
    const companyCode = (req as any).user.company_code;

    if (!newName) return res.status(400).json({ message: "New field name is required" });

    const field = await LeaveExtraField.findOne({ where: { id: req.params.id, companyCode } });
    if (!field) return res.status(404).json({ message: "Field not found" });

    field.name = newName;
    await field.save();

    res.status(200).json({ message: "Field renamed", field });
  } catch (err) {
    console.error("Error renaming field:", err);
    res.status(500).json({ message: "Error renaming field" });
  }
};



// Delete by ID
 const deleteExtraField = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code; 

    const field = await LeaveExtraField.findOne({ where: { id: req.params.id, companyCode } });
    if (!field) return res.status(404).json({ message: "Field not found" });

    await field.destroy();
    res.status(200).json({ message: "Field deleted" });
  } catch (err) {
    console.error("Error deleting field:", err);
    res.status(500).json({ message: "Error deleting field" });
  }
};


//leave balance
const getLeaveBalance = async (req: any, res: any): Promise<any> => {
  try {
    // console.log("req.user =>", req.user);

    const employeeId = req.user.id;
    const companyCode = req.user.company_code || req.user.companyCode; 

    const balance = await calculateLeaveBalance(employeeId, companyCode);

    res.json(balance);
  } catch (error: any) {
    console.error("Error in getLeaveBalance:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllEmployeesLeaveBalance = async (req: any, res: Response): Promise<any> => {
  try {
    // Token से आया user
    const companyCode = req.user.company_code || req.user.companyCode;

    if (!companyCode) {
      return res.status(400).json({ message: "Company code missing in token" });
    }

    // उस company के सभी employees
    const employees = await Onboarding.findAll({
      where: { company_code: companyCode },
      attributes: ["id", "name", "email", "designation", "department"], // सिर्फ जरूरी fields
    });

    if (!employees.length) {
      return res.status(404).json({ message: "No employees found for this company" });
    }

    // सभी employees के balances parallel लाना
    const balances = await Promise.all(
      employees.map(async (emp) => {
        const balance = await calculateLeaveBalance(emp.id, companyCode);
        return {
          employee: {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            designation: emp.designation,
            department: emp.department,
          },
          leaveBalance: balance.leaves,
        };
      })
    );

    res.json({
      companyCode,
      employees: balances,
    });
  } catch (error: any) {
    console.error("Error in getAllEmployeesLeaveBalance:", error);
    res.status(500).json({ message: error.message });
  }
};


// ✅ Set or Update Financial Year
const setFinancialYear = async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate } = req.body;
    const companyCode = (req as any).user.company_code;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start and End Date are required" });
    }

    // ✅ Check if already exists
    const existingFY = await FinancialYear.findOne({ where: { companyCode } });

    if (existingFY) {
      return res.status(400).json({
        message: "Financial Year already exists for this company",
        financialYear: existingFY,
      });
    }

    // ✅ Create new
    const fy = await FinancialYear.create({
      companyCode,
      startDate,
      endDate,
    });

    return res.status(201).json({
      message: "Financial Year created successfully",
      financialYear: fy,
    });
  } catch (error: any) {
    console.error("Error in setFinancialYear:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ✅ Get Company Financial Year
const getFinancialYear = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code;

    const fy = await FinancialYear.findOne({ where: { companyCode } });

    if (!fy) {
      return res.status(404).json({ message: "Financial Year not found" });
    }

    res.status(200).json(fy);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Financial Year
const deleteFinancialYear = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code;

    const deleted = await FinancialYear.destroy({ where: { companyCode } });

    if (!deleted) {
      return res.status(404).json({ message: "No Financial Year found to delete" });
    }

    res.status(200).json({ message: "Financial Year deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



export { applyLeave, getMyLeaves, getAllLeaves, approveLeave, 
  rejectLeave, addNewCategory, getLeaveCategory,updateLeaveCategory
  , deleteLeavecategory, addExtraField,getExtraFields,getExtraFieldById, renameExtraField, deleteExtraField ,getLeaveBalance ,
getAllEmployeesLeaveBalance,setFinancialYear,getFinancialYear,deleteFinancialYear};

