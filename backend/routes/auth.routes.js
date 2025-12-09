import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { userModel } from "../models/user.model.js"; 
import { verifyToken } from "../middleware/authMiddleware.js";
import { getProfile } from "../controllers/auth.controller.js";

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Routes

router.get("/profile", verifyToken, getProfile);

// Admin Routes
// user promoted to admin
router.put("/make-admin", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOneAndUpdate(
            { email }, 
            { role: "admin" }, 
            { new: true }
        );
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User promoted to Admin", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ------------------------------------------------------------------------

export default router;