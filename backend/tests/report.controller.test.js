import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/order.model.js', () => {
    const mockModel = jest.fn();
    mockModel.aggregate = jest.fn();
    mockModel.countDocuments = jest.fn();
    return { OrderModel: mockModel };
});

jest.unstable_mockModule('pdfkit', () => {
    return {
        default: jest.fn().mockImplementation(() => ({
            pipe: jest.fn(),
            fontSize: jest.fn().mockReturnThis(),
            text: jest.fn().mockReturnThis(),
            moveDown: jest.fn().mockReturnThis(),
            end: jest.fn(),
            y: 100
        }))
    };
});

const { getDashboardStats, exportDashboardStatsPDF } = await import('../controllers/report.controller.js');
const { OrderModel } = await import('../models/order.model.js');
const PDFDocument = (await import('pdfkit')).default;

describe('Report Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getDashboardStats', () => {
        it('should return dashboard stats successfully', async () => {
            const mockTotalStats = [{ totalRevenue: 1000, totalOrders: 10 }];
            const mockDailyStats = [{ _id: '2023-10-27', dailyRevenue: 100, orderCount: 1 }];
            const mockPendingCount = 5;
            const mockTopSelling = [{ _id: 'Pizza', totalSold: 20 }];

            OrderModel.aggregate
                .mockResolvedValueOnce(mockTotalStats) // 1. Total Revenue & Count
                .mockResolvedValueOnce(mockDailyStats) // 2. Revenue by Day
                .mockResolvedValueOnce(mockTopSelling); // 3. Top Selling Items (inside response object construction)

            OrderModel.countDocuments.mockResolvedValue(mockPendingCount);

            await getDashboardStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                totalRevenue: 1000,
                totalOrders: 10,
                pendingOrders: 5,
                dailyStats: mockDailyStats,
                topSellingItems: mockTopSelling
            });
        });

        it('should handle empty stats', async () => {
            OrderModel.aggregate
                .mockResolvedValueOnce([]) // 1. Total Revenue & Count
                .mockResolvedValueOnce([]) // 2. Revenue by Day
                .mockResolvedValueOnce([]); // 3. Top Selling Items

            OrderModel.countDocuments.mockResolvedValue(0);

            await getDashboardStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                totalRevenue: 0,
                totalOrders: 0,
                pendingOrders: 0,
                dailyStats: [],
                topSellingItems: []
            });
        });

        it('should handle errors', async () => {
            const errorMessage = 'Database error';
            OrderModel.aggregate.mockRejectedValue(new Error(errorMessage));

            await getDashboardStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });

    describe('exportDashboardStatsPDF', () => {
        it('should generate PDF report successfully', async () => {
            const mockTotalStats = [{ totalRevenue: 1000, totalOrders: 10 }];
            const mockPendingCount = 5;
            const mockTopSelling = [{ _id: 'Pizza', totalSold: 20 }];
            const mockDailyStats = [{ _id: '2023-10-27', dailyRevenue: 100, orderCount: 1 }];

            OrderModel.aggregate
                .mockResolvedValueOnce(mockTotalStats)
                .mockResolvedValueOnce(mockTopSelling)
                .mockResolvedValueOnce(mockDailyStats);

            OrderModel.countDocuments.mockResolvedValue(mockPendingCount);

            await exportDashboardStatsPDF(req, res);

            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=dashboard_report.pdf');
            expect(PDFDocument).toHaveBeenCalled();
        });

        it('should handle errors during PDF generation', async () => {
            const errorMessage = 'Database error';
            OrderModel.aggregate.mockRejectedValue(new Error(errorMessage));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            await exportDashboardStatsPDF(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to generate PDF report" });

            consoleSpy.mockRestore();
        });
    });
});
