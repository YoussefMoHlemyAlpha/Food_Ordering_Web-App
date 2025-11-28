import { OrderModel } from "../models/order.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue & Count
        const totalStats = await OrderModel.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
        ]);

        // 2. Revenue by Day (Last 7 days)
        const dailyStats = await OrderModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 7 } 
        ]);

        // 3. Pending Orders Count
        const pendingCount = await OrderModel.countDocuments({ status: "pending" });

        res.status(200).json({
            totalRevenue: totalStats[0]?.totalRevenue || 0,
            totalOrders: totalStats[0]?.totalOrders || 0,
            pendingOrders: pendingCount,
            dailyStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};