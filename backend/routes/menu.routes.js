import express from "express";
import { createMenuItem, getMenuItems } from "../controllers/menu.controller.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET /api/menu - Public (Anyone can see the menu)
router.get("/", getMenuItems);

// POST /api/menu - Admin Only (Create new food item with image)
// Note: 'image' must match the key name you use in Postman or Frontend FormData
router.post("/", verifyAdmin, upload.single("image"), createMenuItem);

export default router;