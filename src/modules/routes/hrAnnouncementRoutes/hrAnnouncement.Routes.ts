import { Router } from "express";
import {
  createAnnouncement,
  updateAnnouncement,
  getPreviousAnnouncements,
  deleteAnnouncement,
  getActiveAnnouncements,
} from "../../../modules/controllers";
import { authenticateCompanyMaster ,authenticateEmployee,authenticateUser} from "../../../middlewares/authMiddleware";

const hrAnnouncementRouter = Router();

// HR actions
hrAnnouncementRouter.post("/hr/announcement", authenticateUser, createAnnouncement);
// hrAnnouncementRouter.get("/hr/announcement",authenticateUser, getActiveAnnouncements);
hrAnnouncementRouter.get(
  "/hr/previousannouncement",
  authenticateUser, // authenticateEmployee only check token dont check roles so it works for both employee aur company token 
  getPreviousAnnouncements
);

hrAnnouncementRouter.get(
  "/hr/announcement",
  authenticateUser, // authenticateEmployee only check token dont check roles so it works for both employee aur company token 
  getActiveAnnouncements
);

// hrAnnouncementRouter.get(
//   "/hr/announcement",
//   (req, res, next) =>
//     authenticateUser(req as any, res, (err?: any) =>
//       err ? authenticateEmployee(req, res, next) : next()
//     ),
//   getActiveAnnouncements
// );

hrAnnouncementRouter.put("/hr/announcement/:id", authenticateUser, updateAnnouncement);
hrAnnouncementRouter.delete("/hr/announcement/:id", authenticateUser, deleteAnnouncement);

// Employee view

export { hrAnnouncementRouter };
