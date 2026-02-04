import { Router } from "express";
import {
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getEmployeeAssets,
  getAssetHistory,
  getAllAssets,
} from "../../../modules/controllers/index";
import { authenticateCompanyMaster,authenticateUser } from "../../../middlewares/authMiddleware";

const assetRouter = Router();

// Assets
assetRouter.post("/asset", authenticateUser, createAsset);
assetRouter.put("/asset/:id", authenticateUser, updateAsset);
assetRouter.delete("/asset/:id", authenticateUser, deleteAsset);

// Assign / Return
assetRouter.post("/asset/:id/assign", authenticateUser, assignAsset);
assetRouter.post("/asset/:id/return", authenticateUser, returnAsset);

// Fetch
assetRouter.get("/asset/all", authenticateUser, getAllAssets);
assetRouter.get("/asset/employee/:employee_id", authenticateUser, getEmployeeAssets);
assetRouter.get("/asset/:id/history", authenticateUser, getAssetHistory);

export { assetRouter};
