import { Request, Response } from "express";
import { Department,Onboarding } from "../../models/index";



const createDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, HrId } = req.body;
    const companyCode = (req as any).user.company_code; // token से companyCode

    if (!name || !HrId) {
      return res.status(400).json({ message: "Name and HrId are required" });
    }

    // ✅ Same company में same name का department exist करता है या नहीं
    const existingDept = await Department.findOne({
      where: { name, companyCode },
    });
    if (existingDept) {
      return res.status(400).json({
        message: `Department with name '${name}' already exists in this company`,
      });
    }

    // ✅ Check employee exist करता है या नहीं उसी company में
    const hrEmployee = await Onboarding.findOne({
      where: { id: HrId, company_code: companyCode },
    });
    if (!hrEmployee) {
      return res
        .status(404)
        .json({ message: "HR Employee not found in this company" });
    }

    // ✅ Create department
    const department = await Department.create({
      name,
      HrId,
      companyCode,
    });

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (err: any) {
    console.error("Error creating department:", err);
    res.status(500).json({ message: "Error creating department" });
  }
};



// ✅ Get All Departments (company wise)
const getDepartments = async (req: Request, res: Response): Promise<any> => {
  try {
    const companyCode = (req as any).user.company_code; // token से
    const departments = await Department.findAll({
      where: { companyCode },
    });
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Error fetching departments" });
  }
};

// ✅ Get Department by ID (company wise)
const getDepartmentById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const department = await Department.findOne({
      where: { id, companyCode },
    });

    if (!department) {
      return res
        .status(404)
        .json({ message: "Department not found in this company" });
    }

    res.json(department);
  } catch (err) {
    console.error("Error fetching department:", err);
    res.status(500).json({ message: "Error fetching department" });
  }
};


// ✅ Update Department
const updateDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, HrId } = req.body;
    const companyCode = (req as any).user.company_code; // ✅ token से company code

    // ✅ Department उसी company का होना चाहिए
    const department = await Department.findOne({ where: { id, companyCode } });
    if (!department) {
      return res.status(404).json({ message: "Department not found in this company" });
    }

    // ✅ अगर HrId update कर रहे हैं तो check करो
    if (HrId) {
      const hrEmployee = await Onboarding.findOne({
        where: { id: HrId, company_code: companyCode },
      });
      if (!hrEmployee) {
        return res.status(404).json({ message: "HR Employee not found in this company" });
      }
      department.HrId = HrId;
    }

    // ✅ Name update करो अगर दिया है
    if (name) {
      department.name = name;
    }

    await department.save();

    res.json({ message: "Department updated", department });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ message: "Error updating department" });
  }
};


const deleteDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const companyCode = (req as any).user.company_code;

    const department = await Department.findOne({
      where: { id, companyCode },
    });

    if (!department) {
      return res
        .status(404)
        .json({ message: "Department not found in this company" });
    }

    await department.destroy();
    res.json({ message: "Department deleted" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ message: "Error deleting department" });
  }
};
export {createDepartment,getDepartments,updateDepartment,deleteDepartment ,getDepartmentById};