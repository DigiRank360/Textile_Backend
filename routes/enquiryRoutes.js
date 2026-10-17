import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createEnquiry,
  getEnquiries,
  getEnquiry,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", protect, getEnquiries);
router.get("/:id", protect, getEnquiry);
router.delete("/:id", protect, deleteEnquiry);

export default router;