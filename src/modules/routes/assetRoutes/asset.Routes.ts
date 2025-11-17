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
import { authenticateCompanyMaster } from "../../../middlewares/authMiddleware";

const assetRouter = Router();

// Assets
assetRouter.post("/asset", authenticateCompanyMaster, createAsset);
assetRouter.put("/asset/:id", authenticateCompanyMaster, updateAsset);
assetRouter.delete("/asset/:id", authenticateCompanyMaster, deleteAsset);

// Assign / Return
assetRouter.post("/asset/:id/assign", authenticateCompanyMaster, assignAsset);
assetRouter.post("/asset/:id/return", authenticateCompanyMaster, returnAsset);

// Fetch
assetRouter.get("/asset/all", authenticateCompanyMaster, getAllAssets);
assetRouter.get("/asset/employee/:employee_id", authenticateCompanyMaster, getEmployeeAssets);
assetRouter.get("/asset/:id/history", authenticateCompanyMaster, getAssetHistory);

export { assetRouter};
