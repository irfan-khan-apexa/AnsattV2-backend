import { Request, Response } from "express";
import { Department, DepartmentPolicy } from "../../models/index";

const getCompanyCode = (req: Request): string | undefined => {
  const user = (req as any).user;
  return user?.company_code ?? user?.companyCode;
};

const POLICY_FIELDS = [
  "attendancePolicy",
  "shiftPolicy",
  "leavePolicy",
  "holidayPolicy",
  "payrollPolicy",
  "documentPolicy",
] as const;

const getPolicyPayload = (body: any) => {
  const payload: Record<string, unknown> = {};

  for (const field of POLICY_FIELDS) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  return payload;
};

// ================= CREATE DEPARTMENT POLICY =================
const createDepartmentPolicy = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const companyCode = getCompanyCode(req);
    const departmentId = Number(req.body.departmentId);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({
        message: "Valid departmentId is required",
      });
    }

    const department = await Department.findOne({
      where: { id: departmentId, companyCode },
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found in this company",
      });
    }

    const existingPolicy = await DepartmentPolicy.findOne({
      where: { companyCode, departmentId },
    });

    if (existingPolicy) {
      return res.status(409).json({
        message: "Policy already exists for this department",
      });
    }

    const policy = await DepartmentPolicy.create({
      companyCode,
      departmentId,
      ...getPolicyPayload(req.body),
    } as any);

    return res.status(201).json({
      message: "Department policy created successfully",
      data: policy,
    });
  } catch (error: any) {
    console.error("createDepartmentPolicy error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Policy already exists for this department",
      });
    }

    return res.status(500).json({
      message: "Failed to create department policy",
    });
  }
};

// ================= GET ALL DEPARTMENT POLICIES =================
const getDepartmentPolicies = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const companyCode = getCompanyCode(req);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    const policies = await DepartmentPolicy.findAll({
      where: { companyCode },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      total: policies.length,
      data: policies,
    });
  } catch (error) {
    console.error("getDepartmentPolicies error:", error);

    return res.status(500).json({
      message: "Failed to fetch department policies",
    });
  }
};

// ================= GET POLICY BY ID =================
const getDepartmentPolicyById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const companyCode = getCompanyCode(req);
    const id = Number(req.params.id);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid policy ID",
      });
    }

    const policy = await DepartmentPolicy.findOne({
      where: { id, companyCode },
    });

    if (!policy) {
      return res.status(404).json({
        message: "Department policy not found",
      });
    }

    return res.status(200).json({ data: policy });
  } catch (error) {
    console.error("getDepartmentPolicyById error:", error);

    return res.status(500).json({
      message: "Failed to fetch department policy",
    });
  }
};

// ================= UPDATE DEPARTMENT POLICY =================
const updateDepartmentPolicy = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const companyCode = getCompanyCode(req);
    const id = Number(req.params.id);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid policy ID",
      });
    }

    const payload = getPolicyPayload(req.body);

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "At least one valid policy field is required",
      });
    }

    const policy = await DepartmentPolicy.findOne({
      where: { id, companyCode },
    });

    if (!policy) {
      return res.status(404).json({
        message: "Department policy not found",
      });
    }

    await policy.update(payload);

    return res.status(200).json({
      message: "Department policy updated successfully",
      data: policy,
    });
  } catch (error) {
    console.error("updateDepartmentPolicy error:", error);

    return res.status(500).json({
      message: "Failed to update department policy",
    });
  }
};

// ================= DELETE DEPARTMENT POLICY =================
const deleteDepartmentPolicy = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const companyCode = getCompanyCode(req);
    const id = Number(req.params.id);

    if (!companyCode) {
      return res.status(401).json({
        message: "Company code missing from token",
      });
    }

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid policy ID",
      });
    }

    const policy = await DepartmentPolicy.findOne({
      where: { id, companyCode },
    });

    if (!policy) {
      return res.status(404).json({
        message: "Department policy not found",
      });
    }

    await policy.destroy();

    return res.status(200).json({
      message: "Department policy deleted successfully",
    });
  } catch (error) {
    console.error("deleteDepartmentPolicy error:", error);

    return res.status(500).json({
      message: "Failed to delete department policy",
    });
  }
};
export {
  createDepartmentPolicy,
  getDepartmentPolicies,
  getDepartmentPolicyById,
  updateDepartmentPolicy,
  deleteDepartmentPolicy,
};
