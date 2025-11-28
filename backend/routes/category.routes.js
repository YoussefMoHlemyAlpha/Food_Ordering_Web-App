import express from "express";
import { categoryModel } from "../models/category.model.js";
import { upload } from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const categories = await categoryModel.find({ isActive: true });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/add-category", upload.single("image"), async (req, res) => {
    try {
        const { name } = req.body;
        // Multer stores the uploaded file info in req.file
        const image = req.file ? `/uploads/${req.file.filename}` : "";

        const newCat = new categoryModel({
            name,
            image
        });

        await newCat.save();
        res.status(201).json(newCat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;