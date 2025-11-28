import { reviewModel } from "../models/review.model.js";
import { OrderModel } from "../models/order.model.js";

// Add a review
export const addReview = async (req, res) => {
    try {
        const { orderId, menuItemId, rating, comment } = req.body;
        const userId = req.user.id;

        // Validation: Check if the user actually ordered this item and it is delivered
        const order = await OrderModel.findOne({ 
            _id: orderId, 
            userId: userId, 
            status: "delivered",
            "items.menuItemId": menuItemId
        });

        if (!order) {
            return res.status(400).json({ message: "You can only review items from delivered orders." });
        }

        // Check if already reviewed
        const existingReview = await reviewModel.findOne({ userId, orderId, menuItemId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this item." });
        }

        const newReview = new reviewModel({
            userId,
            orderId,
            menuItemId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews for a specific menu item
export const getItemReviews = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const reviews = await reviewModel.find({ menuItemId }).populate("userId", "firstName");
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};