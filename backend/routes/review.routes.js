import express from "express";
import { addReview, getItemReviews } from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, addReview);
router.get("/:menuItemId", getItemReviews);

export default router;