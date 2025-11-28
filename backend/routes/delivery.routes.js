import express from "express";
import { createDeliveryMan, getAllDeliveryMen, assignDelivery, completeDelivery, getPendingOrders, acceptOrder, markAsDelivered, getMyActiveOrder } from "../controllers/delivery.controller.js";
import { verifyAdmin, verifyDeliveryMan } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin only routes
router.post("/add", verifyAdmin, createDeliveryMan);
router.get("/", verifyAdmin, getAllDeliveryMen);
router.post("/assign/:orderId", verifyAdmin, assignDelivery);
router.post("/complete/:orderId", verifyAdmin, completeDelivery);

// Delivery man routes
router.get("/pending-orders", verifyDeliveryMan, getPendingOrders);
router.get("/my-active-order", verifyDeliveryMan, getMyActiveOrder);
router.post("/accept/:orderId", verifyDeliveryMan, acceptOrder);
router.post("/mark-delivered/:orderId", verifyDeliveryMan, markAsDelivered);

export default router;
