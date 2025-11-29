import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/order.model.js', () => {
    const mockModel = jest.fn();
    mockModel.find = jest.fn();
    mockModel.findById = jest.fn();
    mockModel.findByIdAndUpdate = jest.fn();
    return { OrderModel: mockModel };
});

jest.unstable_mockModule('../models/menuItem.model.js', () => {
    const mockModel = jest.fn();
    mockModel.findById = jest.fn();
    return { ItemModel: mockModel };
});

const { createOrder, getUserOrders, getOrderById, updateOrderStatus, getAllOrders } = await import('../controllers/order.controller.js');
const { OrderModel } = await import('../models/order.model.js');
const { ItemModel } = await import('../models/menuItem.model.js');

describe('Order Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {}, user: { id: 'userId', role: 'user' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create a new order successfully', async () => {
            req.body = {
                items: [{ menuItemId: 'itemId', quantity: 2 }],
                deliveryAddress: 'Cairo',
                paymentMethod: 'Cash'
            };

            ItemModel.findById.mockResolvedValue({ price: 10 });

            const mockSave = jest.fn().mockResolvedValue({});
            OrderModel.mockImplementation(() => ({
                save: mockSave,
                _id: 'orderId'
            }));

            await createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Order placed successfully" }));
        });

        it('should return 400 if no items in order', async () => {
            req.body = { items: [] };

            await createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "No items in order" });
        });

        it('should return 404 if item not found', async () => {
            req.body = { items: [{ menuItemId: 'itemId', quantity: 1 }] };
            ItemModel.findById.mockResolvedValue(null);

            await createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getUserOrders', () => {
        it('should return user orders', async () => {
            const mockOrders = [{ _id: 'order1' }];
            OrderModel.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockOrders)
            });

            await getUserOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });
    });

    describe('getOrderById', () => {
        it('should return order by id', async () => {
            req.params.id = 'orderId';
            const mockOrder = { _id: 'orderId', userId: 'userId' };

            OrderModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrder)
            });

            await getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        it('should return 403 if access denied', async () => {
            req.params.id = 'orderId';
            req.user.id = 'otherUserId';
            const mockOrder = { _id: 'orderId', userId: 'userId' };

            OrderModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrder)
            });

            await getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status', async () => {
            req.params.id = 'orderId';
            req.body.status = 'delivered';
            const mockOrder = { _id: 'orderId', status: 'delivered' };

            OrderModel.findByIdAndUpdate.mockResolvedValue(mockOrder);

            await updateOrderStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });
    });

    describe('getAllOrders', () => {
        it('should return all orders', async () => {
            const mockOrders = [{ _id: 'order1' }];
            OrderModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockOrders)
                })
            });

            await getAllOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });
    });
});