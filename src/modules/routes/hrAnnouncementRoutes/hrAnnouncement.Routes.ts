import { Router } from "express";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
} from "../../../modules/controllers";
import { authenticateCompanyMaster ,authenticateEmployee} from "../../../middlewares/authMiddleware";

const hrAnnouncementRouter = Router();

// HR actions
hrAnnouncementRouter.post("/hr/announcement", authenticateCompanyMaster, createAnnouncement);
// hrAnnouncementRouter.get("/hr/announcement",authenticateCompanyMaster, getActiveAnnouncements);
hrAnnouncementRouter.get(
  "/hr/announcement",
  authenticateEmployee, // authenticateEmployee only check token dont check roles so it works for both employee aur company token 
  getActiveAnnouncements
);

// hrAnnouncementRouter.get(
//   "/hr/announcement",
//   (req, res, next) =>
//     authenticateCompanyMaster(req as any, res, (err?: any) =>
//       err ? authenticateEmployee(req, res, next) : next()
//     ),
//   getActiveAnnouncements
// );

hrAnnouncementRouter.put("/hr/announcement/:id", authenticateCompanyMaster, updateAnnouncement);
hrAnnouncementRouter.delete("/hr/announcement/:id", authenticateCompanyMaster, deleteAnnouncement);

// Employee view

export { hrAnnouncementRouter };
