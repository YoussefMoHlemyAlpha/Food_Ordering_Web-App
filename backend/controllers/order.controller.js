import { OrderModel } from "../models/order.model.js";
import { ItemModel } from "../models/menuItem.model.js";

export const createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod } = req.body;
        const userId = req.user.id; // From JWT middleware

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        // 1. Calculate total amount securely
        let totalAmount = 0;
        // We iterate through items sent by user to check prices in DB
        for (let item of items) {
            const dbItem = await ItemModel.findById(item.menuItemId);
            if (!dbItem) return res.status(404).json({ message: `Item not found: ${item.name}` });
            totalAmount += dbItem.price * item.quantity;
        }

        // 2. Create Order
        const newOrder = new OrderModel({
            userId,
            items,
            totalAmount,
            deliveryAddress,
            payment: {
                method: paymentMethod || "Cash",
                status: "Pending"
            },
            status: "pending" // Ensure this matches your enum update
        });

        await newOrder.save();

        res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};





export const getUserOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Order (For Tracking)
export const getOrderById = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id).populate("items.menuItemId");
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security: Ensure the user requesting is the one who made the order (or is Admin)
        if (req.user.role !== "admin" && req.user.role !== "Chief" && order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Order Status (For Admin/Chief)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await OrderModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find()
            .populate("userId", "firstName email") // Populate user info
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};