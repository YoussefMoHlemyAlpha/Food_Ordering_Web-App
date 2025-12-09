import { ItemModel } from "../models/menuItem.model.js";
import { reviewModel } from "../models/review.model.js";

// Create Item (Admin only)
export const createMenuItem = async (req, res) => {
    try {
        const { name, description, price, categoryId } = req.body;
        // Multer adds the file object to req
        const image = req.file ? `/uploads/${req.file.filename}` : "";

        const newItem = new ItemModel({
            name, description, price, categoryId, image
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Items
export const getMenuItems = async (req, res) => {
    try {
        const items = await ItemModel.find({ isAvailable: true }).populate("categoryId");
        if (!items) {
            return res.status(404).json({ message: "No items found" });
        }
        // Calculate average rating for each item
        const itemsWithRating = await Promise.all(items.map(async (item) => {
            const reviews = await reviewModel.find({ menuItemId: item._id });
            const avgRating = reviews.length > 0
                ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
                : 0;

            return { ...item._doc, averageRating: avgRating.toFixed(1), reviewCount: reviews.length }; // spread item properties
        }));

        res.status(200).json(itemsWithRating);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};