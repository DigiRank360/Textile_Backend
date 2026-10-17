import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";

import {
  createProperty,
  updateProperty,
  getProperties,
  getProperty,
  deleteProperty,
} from "../controllers/propertyController.js";

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);

router.post("/", protect, upload.array("images", 20), createProperty);
router.put("/:id", protect, upload.array("images", 20), updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;
