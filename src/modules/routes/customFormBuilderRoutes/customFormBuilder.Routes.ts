import { Router } from "express";

import {
  upsertCustomDocument,
  getAllCustomDocuments,
  getCustomDocument,
  deleteCustomDocument,
} from "../../../modules/controllers/index";

import {
  authenticateUser,
} from "../../../middlewares/authMiddleware";

const customDocumentRouter = Router();

customDocumentRouter.put(
  "/custom-document",
  authenticateUser,
  upsertCustomDocument
);

customDocumentRouter.get(
  "/custom-document/all",
  authenticateUser,
  getAllCustomDocuments
);

customDocumentRouter.get(
  "/custom-document/:id",
  authenticateUser,
  getCustomDocument
);


customDocumentRouter.delete(
  "/custom-document/:id",
  authenticateUser,
  deleteCustomDocument
);

export { customDocumentRouter };