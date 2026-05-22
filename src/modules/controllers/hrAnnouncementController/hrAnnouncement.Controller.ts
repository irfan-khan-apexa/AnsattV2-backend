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
import { HrAnnouncement } from "../../models";
import { CompanyRequest } from "../../../middlewares/authMiddleware";
import Sequelize from "sequelize";
import { Op } from "sequelize";
import { audit } from "../../../helpers/audit.helper"; // 🔥 AUDIT

const createAnnouncement = async (req: CompanyRequest, res: Response) : Promise<any> => {
  try {
    const { title, message, type, priority, publish_from, publish_till } = req.body;
    const company_code = req.user.company_code;

    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    if (publish_from && publish_till && new Date(publish_from) > new Date(publish_till)) {
      return res.status(400).json({ message: "publish_from cannot be after publish_till" });
    }

    const announcement = await HrAnnouncement.create({
      company_code,
      title,
      message,
      type,
      priority,
      publish_from: publish_from ? new Date(publish_from) : null,
      publish_till: publish_till ? new Date(publish_till) : null,
      created_by: req.user.id,
    });

    // 🔥 AUDIT
    await audit(req, {
      module: "hrAnnouncement",
      action: "create",
      record_id: announcement.id,
      new_value: announcement,
    });

    return res.status(201).json({ message: "Announcement created", data: announcement });
  } catch (err: any) {
    return res.status(500).json({ message: "Error creating announcement", error: err.message });
  }
};

const getActiveAnnouncements = async (req: CompanyRequest, res: Response): Promise<any>  => {
  try {
    const company_code = req.user.company_code;
    const now = new Date();

    const announcements = await HrAnnouncement.findAll({
      where: {
        company_code,
        is_active: true,
        publish_from: { [Op.lte]: now },
        [Op.or]: [
          { publish_till: null },
          { publish_till: { [Op.gte]: now } },
        ],
      },
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
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

    const announcements = await HrAnnouncement.findAll({
      where: {
        company_code,
        is_active: true, 
      },
      order: [
        ["priority", "DESC"],
        ["publish_from", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      message: "All announcements fetched",
      data: announcements,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error fetching announcements",
      error: err.message,
    });
  }
};

const updateAnnouncement = async (req: CompanyRequest, res: Response) : Promise<any> => {
  try {
    const { id } = req.params;
    const company_code = req.user.company_code;

    const announcement = await HrAnnouncement.findOne({ where: { id, company_code } });
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const oldData = announcement.toJSON(); // 🔥 AUDIT

    await announcement.update(req.body);

    // 🔥 AUDIT
    await audit(req, {
      module: "hrAnnouncement",
      action: "update",
      record_id: announcement.id,
      old_value: oldData,
      new_value: announcement,
    });

    return res.status(200).json({ message: "Announcement updated", data: announcement });
  } catch (err: any) {
    return res.status(500).json({ message: "Error updating announcement", error: err.message });
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