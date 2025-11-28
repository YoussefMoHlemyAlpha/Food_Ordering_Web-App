import express from "express";
import { createOrder, getUserOrders ,getOrderById,updateOrderStatus,getAllOrders } from "../controllers/order.controller.js";
import { verifyToken , verifyAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

// Both creating and viewing orders require the user to be logged in
router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getUserOrders);
router.get("/all", verifyAdmin, getAllOrders)
router.get("/:id", verifyToken, getOrderById); // New Route
router.put("/:id/status", verifyAdmin, updateOrderStatus);

export default router;