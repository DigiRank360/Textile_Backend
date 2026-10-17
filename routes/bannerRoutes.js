import express from "express";
import jwt from "jsonwebtoken";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";

const router = express.Router();

// Attaches the admin when a valid token is sent so ?all=true can include inactive banners.
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ") && process.env.JWT_SECRET) {
    try {
      req.admin = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      // invalid token: treat as a public request
    }
  }
  next();
};

router.get("/", optionalAuth, getBanners);
router.post("/", protect, upload.single("image"), createBanner);
router.put("/:id", protect, upload.single("image"), updateBanner);
router.delete("/:id", protect, deleteBanner);

export default router;
