import { Request, Response } from "express";
import { Leave ,LeaveMaster,LeaveTransaction,LeaveExtraField,FinancialYear,Onboarding,Department,LeaveActionToken} from "../../models";
import { Op } from "sequelize";
import { calculateLeaveBalance } from "../../../utils/leaveUtils";
import { sendMail } from "../../../utils/mailer";
import * as crypto from "crypto";



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

const applyLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    // token-derived
    const employeeId = (req as any).user?.id;
    
    const companyCode = (req as any).user?.company_code || (req as any).user?.companyCode;
    
    // console.log("employeeId",employeeId,"companyCode",companyCode);
    const { category, startDate, endDate, reason } = req.body;

    // input validations
    if (!employeeId) return res.status(401).json({ message: "Invalid token: user id missing" });
    if (!companyCode) return res.status(401).json({ message: "Invalid token: company_code missing" });
    if (!category || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "category, startDate, endDate and reason are required" });
    }

    const employee = await Onboarding.findByPk(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // calculate days (inclusive)
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    const calculatedDays = Math.ceil((ed.getTime() - sd.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (calculatedDays <= 0) return res.status(400).json({ message: "endDate must be same or after startDate" });

    // debug log for developers
    console.log("applyLeave -> payload:", {
      employeeId,
      companyCode,
      category,
      startDate,
      endDate,
      calculatedDays,
      reason,
    });

    // create record
    const leave = await LeaveTransaction.create({
      companyCode,
      employeeId,
      employeeName: (employee as any).name,
      category,
      startDate,
      endDate,
      noOfDays: calculatedDays,
      reason,
      status: "Pending",
    });

    // find recipients (HR + manager)
    const recipients: string[] = [];

    if ((employee as any).department) {
      const dept = await Department.findByPk((employee as any).department);
      if (dept && (dept as any).HrId) {
        const hr = await Onboarding.findByPk((dept as any).HrId);
        if (hr?.email) recipients.push(hr.email);
      }
    }

    if ((employee as any).reporting_manager) {
      const manager = await Onboarding.findByPk((employee as any).reporting_manager);
      if (manager?.email) recipients.push(manager.email);
    }

    // create tokens & send mails (if recipients exist)
    for (const recipient of recipients) {
      const actionToken = crypto.randomBytes(32).toString("hex");

      await LeaveActionToken.create({
        leaveId: leave.id,
        token: actionToken,
        email: recipient,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        used: false,
      });

      // NOTE: use your public domain in production
      const approveUrl = `${process.env.APP_ORIGIN || "http://localhost:5000"}/api/leaves/action?token=${actionToken}&type=approve`;
      const rejectUrl = `${process.env.APP_ORIGIN || "http://localhost:5000"}/api/leaves/action?token=${actionToken}&type=reject`;

      const mailHtml = `
        <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
          <h2>New Leave Application</h2>
          <p>A new leave request has been submitted by <b>${(employee as any).name}</b> (Employee ID: <b>${employeeId}</b>).</p>
          <table border="1" cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
            <tr><td><b>Employee Name</b></td><td>${(employee as any).name}</td></tr>
            <tr><td><b>Employee ID</b></td><td>${employeeId}</td></tr>
            <tr><td><b>Department</b></td><td>${(employee as any).department}</td></tr>
            <tr><td><b>Leave Category</b></td><td>${category}</td></tr>
            <tr><td><b>Start Date</b></td><td>${startDate}</td></tr>
            <tr><td><b>End Date</b></td><td>${endDate}</td></tr>
            <tr><td><b>Total Days</b></td><td>${calculatedDays}</td></tr>
            <tr><td><b>Reason</b></td><td>${reason}</td></tr>
          </table>
          <p style="margin-top:20px;">Please take the necessary action:</p>
          <a href="${approveUrl}" style="background:#28a745; color:#fff; padding:10px 18px; text-decoration:none; border-radius:5px; margin-right:10px;">Approve</a>
          <a href="${rejectUrl}" style="background:#dc3545; color:#fff; padding:10px 18px; text-decoration:none; border-radius:5px;">Reject</a>
        </div>
      `;

      // send mail (ensure sendMail handles array or single)
      try {
        await sendMail([recipient], "New Leave Request Submitted", mailHtml);
      } catch (mailErr) {
        console.error("Failed to send leave notification to", recipient, mailErr);
        // do not rollback leave creation — just log
      }
    }

    return res.status(201).json({ message: "Leave applied & mails sent", leave });
  } catch (err: any) {
    console.error("Error applying leave:", err);
    return res.status(500).json({ message: "Error applying leave", error: err.message });
  }
};

const getMyLeaves = async (req: Request, res: Response): Promise<any> => {
  try {
    const employeeId = (req as any).user.id;
    const companyCode = (req as any).user.company_code || (req as any).user.companyCode;

    if (!companyCode) {
      return res.status(401).json({ message: "Invalid token: company_code missing" });
    }

    const leaves = await LeaveTransaction.findAll({
      where: { employeeId, companyCode },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ total: leaves.length, leaves });
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ message: "Error fetching leaves" });
  }
};




// ✅ Get All Leaves (HR/Manager)
// --- getAllLeaves (updated) ---
const getAllLeaves = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = "1", limit = "10", search, status, category, start, end } = req.query;

    const user = (req as any).user;
    console.log();
    
    const companyCode = user?.company_code || user?.companyCode;

    if (!companyCode && !user?.isSuperAdmin) {
      return res.status(401).json({ message: "Invalid token: company_code missing" });
    }

    const whereClause: any = {};

    // Enforce company filter for non-super-admin users
    if (!user?.isSuperAdmin) {
      whereClause.companyCode = companyCode;
    }

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

const handleLeaveAction = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, type, reason } = req.query;

    if (!token || !type || !["approve", "reject"].includes(type as string)) {
      return res.status(400).send("Invalid link");
    }

    const actionToken = await LeaveActionToken.findOne({ where: { token } });
    if (!actionToken) return res.status(400).send("Invalid or expired link");
    if (new Date() > actionToken.expiresAt) {
      await actionToken.destroy(); // ⏳ expired → delete
      return res.status(400).send("Link expired");
    }

    const leave = await LeaveTransaction.findByPk(actionToken.leaveId);
    if (!leave) {
      await actionToken.destroy(); // ❌ leave not found → delete
      return res.status(404).send("Leave not found");
    }
    if (leave.status !== "Pending") {
      await actionToken.destroy(); // ⚠️ already processed → delete
      return res.status(400).send("Leave already processed");
    }

    // 🔹 Find approver by email
    const approver = await Onboarding.findOne({ where: { email: actionToken.email } });
    if (!approver) {
      await actionToken.destroy(); // 👤 approver not found → delete
      return res.status(404).send("Approver not found");
    }

    // ✅ If Reject clicked but no reason yet → show form
    if (type === "reject" && !reason) {
      return res.send(`
        <div style="font-family: Arial; max-width:500px; margin:50px auto; padding:20px; border:1px solid #ccc; border-radius:8px;">
          <h2>Reject Leave Request</h2>
          <p>Please provide a reason for rejection:</p>
          <form method="GET" action="/api/leaves/action">
            <input type="hidden" name="token" value="${token}" />
            <input type="hidden" name="type" value="reject" />
            <textarea name="reason" rows="4" style="width:100%; padding:8px;" required></textarea>
            <br/><br/>
            <button type="submit" style="background:#dc3545; color:#fff; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">
              Submit Rejection
            </button>
          </form>
        </div>
      `);
    }

    // ✅ Approve / Reject
    leave.status = type === "approve" ? "Approved" : "Rejected";
    leave.actionBy = approver.id;
    leave.actionReason = type === "reject" ? (reason as string || "No reason provided") : null;

    await leave.save();

       // 🗑️ Delete ALL tokens for this leave (including other recipients’)
    await LeaveActionToken.destroy({ where: { leaveId: leave.id } });

    return res.send(`
      <div style="font-family: Arial; text-align:center; padding:30px;">
        <h2>Leave ${leave.status}</h2>
        <p>Leave request of <b>${leave.employeeName}</b> has been <b>${leave.status}</b>.</p>
        ${leave.status === "Rejected" ? `<p>Reason: ${leave.actionReason}</p>` : ""}
      </div>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};






// ✅ Approve Leave


// // ✅ Approve Leave (from App)
// const approveLeave = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const leave = await LeaveTransaction.findByPk(req.params.id);
//     if (!leave) return res.status(404).json({ message: "Leave not found" });

//     if (leave.status !== "Pending") {
//       return res.status(400).json({ message: "Leave already processed" });
//     }

//     leave.status = "Approved";
//     await leave.save();

//     // 🗑️ Delete all tokens for this leave
//     await LeaveActionToken.destroy({ where: { leaveId: leave.id } });

//     // 👇 Send mail to employee
//     const employee = await Onboarding.findByPk(leave.employeeId);
//     if (employee?.email) {
//       await sendMail(
//         employee.email,
//         "Leave Approved",
//         `<p>Your leave request from ${leave.startDate} to ${leave.endDate} has been <b>approved</b>.</p>`
//       );
//     }

//     res.status(200).json({ message: "Leave approved", leave });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error approving leave" });
//   }
// };

// // ✅ Reject Leave (from App)
// const rejectLeave = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const leave = await LeaveTransaction.findByPk(req.params.id);
//     if (!leave) return res.status(404).json({ message: "Leave not found" });

//     if (leave.status !== "Pending") {
//       return res.status(400).json({ message: "Leave already processed" });
//     }

//     leave.status = "Rejected";
//     await leave.save();

//     // 🗑️ Delete all tokens for this leave
//     await LeaveActionToken.destroy({ where: { leaveId: leave.id } });

//     // 👇 Send mail to employee
//     const employee = await Onboarding.findByPk(leave.employeeId);
//     if (employee?.email) {
//       await sendMail(
//         employee.email,
//         "Leave Rejected",
//         `<p>Your leave request from ${leave.startDate} to ${leave.endDate} has been <b>rejected</b>.</p>`
//       );
//     }

//     res.status(200).json({ message: "Leave rejected", leave });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error rejecting leave" });
//   }
// };


// ✅ Approve Leave (Updated)
const approveLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const leave = await LeaveTransaction.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Leave already processed" });
    }

    leave.status = "Approved";
    await leave.save();

    // 🗑 Delete all action tokens
    await LeaveActionToken.destroy({ where: { leaveId: leave.id } });

    // ▶ Mail ko background me bhejo (no await)
    const employee = await Onboarding.findByPk(leave.employeeId);
    if (employee?.email) {
      sendMail(
        employee.email,
        "Leave Approved",
        `<p>Your leave request from ${leave.startDate} to ${leave.endDate} has been <b>approved</b>.</p>`
      ).catch((err) => console.log("Mail send failed:", err));
    }

    return res.status(200).json({ message: "Leave approved", leave });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error approving leave" });
  }
};


// ✅ Reject Leave (Updated)
const rejectLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const leave = await LeaveTransaction.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Leave already processed" });
    }

    leave.status = "Rejected";
    await leave.save();

    // 🗑 Delete all action tokens
    await LeaveActionToken.destroy({ where: { leaveId: leave.id } });

    // ▶ Mail ko background me bhejo (no await)
    const employee = await Onboarding.findByPk(leave.employeeId);
    if (employee?.email) {
      sendMail(
        employee.email,
        "Leave Rejected",
        `<p>Your leave request from ${leave.startDate} to ${leave.endDate} has been <b>rejected</b>.</p>`
      ).catch((err) => console.log("Mail send failed:", err));
    }

    return res.status(200).json({ message: "Leave rejected", leave });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error rejecting leave" });
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


// ✅ Set Financial Year
// ✅ Set Financial Year (Always one active at a time + No duplicate date ranges)
const setFinancialYear = async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate } = req.body;
    const companyCode = (req as any).user.company_code;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and End Date are required" });
    }

    // ✅ Duplicate check
  const duplicate = await FinancialYear.findOne({
  where: {
    companyCode,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  },
});

if (duplicate) {
  return res.status(400).json({
    message: "A financial year with the same dates already exists for this company",
    financialYear: duplicate,
  });
}

    // ✅ Step 1: Sabhi purane ko inactive kar do (sirf is company ke liye)
    await FinancialYear.update(
      { isActive: false },
      { where: { companyCode } }
    );

    // ✅ Step 2: Naya year create karo aur active banao
    const fy = await FinancialYear.create({
      companyCode,
      startDate,
      endDate,
      isActive: true,
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




// ✅ Get Current Financial Year
const getFinancialYear = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code;

    const fy = await FinancialYear.findOne({
      where: { companyCode, isActive: true },
    });

    if (!fy) {
      return res.status(404).json({ message: "Active Financial Year not found" });
    }

    res.status(200).json(fy);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Financial Years (history)
const getAllFinancialYears = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code;

    const years = await FinancialYear.findAll({
      where: { companyCode },
      order: [["startDate", "DESC"]],
    });

    res.status(200).json(years);
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



export { applyLeave, getMyLeaves, getAllLeaves,handleLeaveAction, approveLeave, 
  rejectLeave, addNewCategory, getLeaveCategory,updateLeaveCategory
  , deleteLeavecategory, addExtraField,getExtraFields,getExtraFieldById, renameExtraField, deleteExtraField ,getLeaveBalance ,
getAllEmployeesLeaveBalance,setFinancialYear,getFinancialYear,getAllFinancialYears,deleteFinancialYear};

