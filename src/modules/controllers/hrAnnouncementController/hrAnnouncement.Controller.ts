// import { Request, Response } from "express";
// import { HrAnnouncement } from "../../models";
// import { CompanyRequest } from "../../../middlewares/authMiddleware";
// import Sequelize from "sequelize";
// import { Op } from "sequelize";

// const createAnnouncement = async (req: CompanyRequest, res: Response) : Promise<any> => {
//   try {
//     const { title, message, type, priority, publish_from, publish_till } = req.body;
//     const company_code = req.user.company_code;

//     if (!title || !message) {
//       return res.status(400).json({ message: "title and message are required" });
//     }

//     if (publish_from && publish_till && new Date(publish_from) > new Date(publish_till)) {
//       return res.status(400).json({ message: "publish_from cannot be after publish_till" });
//     }

//     const announcement = await HrAnnouncement.create({
//       company_code,
//       title,
//       message,
//       type,
//       priority,
//       publish_from: publish_from ? new Date(publish_from) : null,
//       publish_till: publish_till ? new Date(publish_till) : null,
//       created_by: req.user.id,
//     });

//     return res.status(201).json({ message: "Announcement created", data: announcement });
//   } catch (err: any) {
//     return res.status(500).json({ message: "Error creating announcement", error: err.message });
//   }
// };
// const getActiveAnnouncements = async (req: CompanyRequest, res: Response): Promise<any>  => {
// try {
//     const company_code = req.user.company_code;
//     const now = new Date();

//     const announcements = await HrAnnouncement.findAll({
//       where: {
//         company_code,
//         is_active: true,
//         publish_from: { [Op.lte]: now },
//         [Op.or]: [
//           { publish_till: null },
//           { publish_till: { [Op.gte]: now } },
//         ],
//       },
//       order: [
//         ["priority", "DESC"],
//         ["createdAt", "DESC"],
//       ],
//     });

//     return res.status(200).json({
//       message: "Active announcements fetched",
//       data: announcements,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       message: "Error fetching active announcements",
//       error: err.message,
//     });
//   }
// };
//  const getPreviousAnnouncements = async (
//   req: CompanyRequest,
//   res: Response
// ): Promise<any> => {
//  try {
//     const company_code = req.user.company_code;

//     const announcements = await HrAnnouncement.findAll({
//       where: {
//         company_code,
//         is_active: true, 
//       },
//       order: [
//         ["priority", "DESC"],
//         ["publish_from", "DESC"],
//         ["createdAt", "DESC"],
//       ],
//     });

//     return res.status(200).json({
//       message: "All announcements fetched",
//       data: announcements,
//     });
//   } catch (err: any) {
//     return res.status(500).json({
//       message: "Error fetching announcements",
//       error: err.message,
//     });
//   }
// };

// const updateAnnouncement = async (req: CompanyRequest, res: Response) : Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;

//     const announcement = await HrAnnouncement.findOne({ where: { id, company_code } });
//     if (!announcement) {
//       return res.status(404).json({ message: "Announcement not found" });
//     }

//     await announcement.update(req.body);
//     return res.status(200).json({ message: "Announcement updated", data: announcement });
//   } catch (err: any) {
//     return res.status(500).json({ message: "Error updating announcement", error: err.message });
//   }
// };

// const deleteAnnouncement = async (req: CompanyRequest, res: Response) : Promise<any> => {
//   try {
//     const { id } = req.params;
//     const company_code = req.user.company_code;

//     const announcement = await HrAnnouncement.findOne({ where: { id, company_code } });
//     if (!announcement) {
//       return res.status(404).json({ message: "Announcement not found" });
//     }

//     await announcement.destroy();
//     return res.status(200).json({ message: "Announcement deleted" });
//   } catch (err: any) {
//     return res.status(500).json({ message: "Error deleting announcement", error: err.message });
//   }
// };

// export{createAnnouncement,getActiveAnnouncements,getPreviousAnnouncements,updateAnnouncement,deleteAnnouncement}

import { Request, Response } from "express";
import { Department, HrAnnouncement, Onboarding } from "../../models";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import Sequelize from "sequelize";
import { Op } from "sequelize";
import { audit } from "../../../helpers/audit.helper"; // 🔥 AUDIT

const createAnnouncement = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      title,
      message,
      type,
      priority,
      publish_from,
      publish_till,
      target_departments = [],
      target_employees = [],
    } = req.body;

    const company_code = req.user.company_code;

    if (!title || !message) {
      return res.status(400).json({
        message: "title and message are required",
      });
    }

    if (
      publish_from &&
      publish_till &&
      new Date(publish_from) > new Date(publish_till)
    ) {
      return res.status(400).json({
        message: "publish_from cannot be after publish_till",
      });
    }

    // ==========================================
    // Decide Target Type Automatically
    // ==========================================

    let finalTargetType:
      | "all"
      | "department"
      | "employee"
      | "employee/department" = "all";

    if (
      target_departments.length > 0 &&
      target_employees.length > 0
    ) {
      finalTargetType = "employee/department";
    } else if (target_departments.length > 0) {
      finalTargetType = "department";
    } else if (target_employees.length > 0) {
      finalTargetType = "employee";
    }

    // ==========================================
    // Department Validation
    // ==========================================

    if (target_departments.length > 0) {
      if (!Array.isArray(target_departments)) {
        return res.status(400).json({
          message: "target_departments must be an array.",
        });
      }

      const departments = await Department.findAll({
        where: {
          companyCode: company_code,
          id: {
            [Op.in]: target_departments,
          },
        },
      });

      const foundDepartmentIds = departments.map((d: any) => d.id);

      const invalidDepartments = target_departments.filter(
        (id: number) => !foundDepartmentIds.includes(id)
      );

      if (invalidDepartments.length > 0) {
        return res.status(400).json({
          message: "Invalid department ids.",
          invalidDepartments,
        });
      }
    }

    // ==========================================
    // Employee Validation
    // ==========================================

    if (target_employees.length > 0) {
      if (!Array.isArray(target_employees)) {
        return res.status(400).json({
          message: "target_employees must be an array.",
        });
      }

      const employees = await Onboarding.findAll({
        where: {
          company_code,
          id: {
            [Op.in]: target_employees,
          },
        },
      });

      const foundEmployeeIds = employees.map((e: any) => e.id);

      const invalidEmployees = target_employees.filter(
        (id: number) => !foundEmployeeIds.includes(id)
      );

      if (invalidEmployees.length > 0) {
        return res.status(400).json({
          message: "Invalid employee ids.",
          invalidEmployees,
        });
      }
    }

    // ==========================================
    // Create Announcement
    // ==========================================

    const announcement = await HrAnnouncement.create({
      company_code,
      title,
      message,
      type,
      priority,

      publish_from: publish_from
        ? new Date(publish_from)
        : null,

      publish_till: publish_till
        ? new Date(publish_till)
        : null,

      created_by: req.user.id,

      target_type: finalTargetType,

      target_departments:
        target_departments.length > 0
          ? target_departments
          : null,

      target_employees:
        target_employees.length > 0
          ? target_employees
          : null,
    });

    await audit(req, {
      module: "hrAnnouncement",
      action: "create",
      record_id: announcement.id,
      new_value: announcement,
    });

    return res.status(201).json({
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error creating announcement",
      error: err.message,
    });
  }
};

const getActiveAnnouncements = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code = req.user.company_code;
    const now = new Date();

    let announcements = await HrAnnouncement.findAll({
      where: {
        company_code,
        is_active: true,
        publish_from: {
          [Op.lte]: now,
        },
        [Op.or]: [
          { publish_till: null },
          {
            publish_till: {
              [Op.gte]: now,
            },
          },
        ],
      },
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    // Company Master
    if (req.user.role === "company_master") {
      return res.status(200).json({
        message: "Active announcements fetched",
        data: announcements,
      });
    }

    const employeeId = req.user.id;
    const departmentId = req.user.department_id;

    announcements = announcements.filter((announcement: any) => {
      switch (announcement.target_type) {
        case "all":
          return true;

        case "department":
          return (
            Array.isArray(announcement.target_departments) &&
            announcement.target_departments.includes(departmentId)
          );

        case "employee":
          return (
            Array.isArray(announcement.target_employees) &&
            announcement.target_employees.includes(employeeId)
          );

        case "employee/department":
          const departmentMatch =
            Array.isArray(announcement.target_departments) &&
            announcement.target_departments.includes(departmentId);

          const employeeMatch =
            Array.isArray(announcement.target_employees) &&
            announcement.target_employees.includes(employeeId);

          return departmentMatch || employeeMatch;

        default:
          return false;
      }
    });

    return res.status(200).json({
      message: "Active announcements fetched",
      data: announcements,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching active announcements",
      error: err.message,
    });
  }
};

const getPreviousAnnouncements = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const company_code = req.user.company_code;
    const now = new Date();

    let announcements = await HrAnnouncement.findAll({
      where: {
        company_code,
        is_active: true,
        publish_till: {
          [Op.lt]: now,
        },
      },
      order: [
        ["publish_till", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    // Company Master -> Show All Previous Announcements
    if (req.user.role === "company_master") {
      return res.status(200).json({
        message: "Previous announcements fetched",
        data: announcements,
      });
    }

    // Employee -> Filter announcements
    const employeeId = req.user.id;
    const departmentId = req.user.department_id;

    announcements = announcements.filter((announcement: any) => {
      switch (announcement.target_type) {
        case "all":
          return true;

        case "department":
          return (
            Array.isArray(announcement.target_departments) &&
            announcement.target_departments.includes(departmentId)
          );

        case "employee":
          return (
            Array.isArray(announcement.target_employees) &&
            announcement.target_employees.includes(employeeId)
          );

        case "employee/department":
          const departmentMatch =
            Array.isArray(announcement.target_departments) &&
            announcement.target_departments.includes(departmentId);

          const employeeMatch =
            Array.isArray(announcement.target_employees) &&
            announcement.target_employees.includes(employeeId);

          return departmentMatch || employeeMatch;

        default:
          return false;
      }
    });

    return res.status(200).json({
      message: "Previous announcements fetched",
      data: announcements,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching previous announcements",
      error: err.message,
    });
  }
};
const updateAnnouncement = async (
  req: CompanyRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const {
      title,
      message,
      type,
      priority,
      publish_from,
      publish_till,
      is_active,
      target_departments = [],
      target_employees = [],
    } = req.body;

    const announcement = await HrAnnouncement.findOne({
      where: { id, company_code },
    });

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    if (
      publish_from &&
      publish_till &&
      new Date(publish_from) > new Date(publish_till)
    ) {
      return res.status(400).json({
        message: "publish_from cannot be after publish_till",
      });
    }

    // ==========================================
    // Array Validation
    // ==========================================

    if (
      target_departments &&
      !Array.isArray(target_departments)
    ) {
      return res.status(400).json({
        message: "target_departments must be an array.",
      });
    }

    if (
      target_employees &&
      !Array.isArray(target_employees)
    ) {
      return res.status(400).json({
        message: "target_employees must be an array.",
      });
    }

    // ==========================================
    // Decide Target Type Automatically
    // ==========================================

    let finalTargetType:
      | "all"
      | "department"
      | "employee"
      | "employee/department" = "all";

    if (
      target_departments.length > 0 &&
      target_employees.length > 0
    ) {
      finalTargetType = "employee/department";
    } else if (target_departments.length > 0) {
      finalTargetType = "department";
    } else if (target_employees.length > 0) {
      finalTargetType = "employee";
    }

    // ==========================================
    // Department Validation
    // ==========================================

    if (target_departments.length > 0) {
      const departments = await Department.findAll({
        where: {
          companyCode: company_code,
          id: {
            [Op.in]: target_departments,
          },
        },
      });

      const foundDepartmentIds = departments.map(
        (d: any) => d.id
      );

      const invalidDepartments = target_departments.filter(
        (id: number) => !foundDepartmentIds.includes(id)
      );

      if (invalidDepartments.length > 0) {
        return res.status(400).json({
          message: "Invalid department ids.",
          invalidDepartments,
        });
      }
    }

    // ==========================================
    // Employee Validation
    // ==========================================

    if (target_employees.length > 0) {
      const employees = await Onboarding.findAll({
        where: {
          company_code,
          id: {
            [Op.in]: target_employees,
          },
        },
      });

      const foundEmployeeIds = employees.map(
        (e: any) => e.id
      );

      const invalidEmployees = target_employees.filter(
        (id: number) => !foundEmployeeIds.includes(id)
      );

      if (invalidEmployees.length > 0) {
        return res.status(400).json({
          message: "Invalid employee ids.",
          invalidEmployees,
        });
      }
    }

    const oldData = announcement.toJSON();

    await announcement.update({
      title,
      message,
      type,
      priority,
      publish_from: publish_from
        ? new Date(publish_from)
        : null,
      publish_till: publish_till
        ? new Date(publish_till)
        : null,
      is_active,

      target_type: finalTargetType,

      target_departments:
        target_departments.length > 0
          ? target_departments
          : null,

      target_employees:
        target_employees.length > 0
          ? target_employees
          : null,
    });

    await audit(req, {
      module: "hrAnnouncement",
      action: "update",
      record_id: announcement.id,
      old_value: oldData,
      new_value: announcement,
    });

    return res.status(200).json({
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error updating announcement",
      error: err.message,
    });
  }
};

const deleteAnnouncement = async (req: CompanyRequest, res: Response) : Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const announcement = await HrAnnouncement.findOne({ where: { id, company_code } });
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const oldData = announcement.toJSON(); // 🔥 AUDIT

    await announcement.destroy();

    // 🔥 AUDIT
    await audit(req, {
      module: "hrAnnouncement",
      action: "delete",
      record_id: oldData.id,
      old_value: oldData,
    });

    return res.status(200).json({ message: "Announcement deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: "Error deleting announcement", error: err.message });
  }
};

export {
  createAnnouncement,
  getActiveAnnouncements,
  getPreviousAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
};