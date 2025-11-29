import { describe, jest } from '@jest/globals';

jest.unstable_mockModule('../models/user.model.js', () => {
    const mockModel = jest.fn();
    mockModel.findOne = jest.fn();
    mockModel.findById = jest.fn();
    return { userModel: mockModel };
});

jest.unstable_mockModule('../models/review.model.js', () => {
    const mockModel = jest.fn();
    mockModel.findOne = jest.fn();
    mockModel.findById = jest.fn();
    mockModel.find = jest.fn();
    return { reviewModel: mockModel };
});

jest.unstable_mockModule('../models/order.model.js', () => {
    const mockModel = jest.fn();
    mockModel.findOne = jest.fn();
    return { OrderModel: mockModel };
});

// Dynamic imports
const { addReview, getItemReviews } = await import('../controllers/review.controller.js');
const { reviewModel } = await import('../models/review.model.js');
const { OrderModel } = await import('../models/order.model.js');

describe('Review Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {}, user: { id: 'userId' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.clearAllMocks();
    });

    describe('addReview', () => {
        it('should return 400 if order not found or not delivered', async () => {
            req.body = { orderId: 'orderId', menuItemId: 'menuItemId', rating: 5, comment: 'test' };

            OrderModel.findOne.mockResolvedValue(null);

            await addReview(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "You can only review items from delivered orders." });
        });

        it('should return 400 if already reviewed', async () => {
            req.body = { orderId: 'orderId', menuItemId: 'menuItemId', rating: 5, comment: 'test' };

            OrderModel.findOne.mockResolvedValue({ _id: 'orderId' });
            reviewModel.findOne.mockResolvedValue({ _id: 'reviewId' });

            await addReview(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "You have already reviewed this item." });
        });

        it('should add review successfully', async () => {
            req.body = { orderId: 'orderId', menuItemId: 'menuItemId', rating: 5, comment: 'test' };

            OrderModel.findOne.mockResolvedValue({ _id: 'orderId' });
            reviewModel.findOne.mockResolvedValue(null);

            const mockSave = jest.fn().mockResolvedValue({});
            reviewModel.mockImplementation(() => ({
                save: mockSave
            }));

            await addReview(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: "Review added successfully" });
        });
    });

    describe('getItemReviews', () => {
        it('should return reviews for an item', async () => {
            req.params = { menuItemId: 'menuItemId' };
            const mockReviews = [{ rating: 5, comment: 'Great' }];

            reviewModel.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockReviews)
            });

            await getItemReviews(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockReviews);
        });

        it('should handle errors', async () => {
            req.params = { menuItemId: 'menuItemId' };
            const errorMessage = 'Database error';

            reviewModel.find.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error(errorMessage))
            });

            await getItemReviews(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });
});
