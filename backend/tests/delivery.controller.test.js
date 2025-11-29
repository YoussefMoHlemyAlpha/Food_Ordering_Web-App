import { jest } from '@jest/globals';

// Mock the models and bcryptjs using unstable_mockModule
jest.unstable_mockModule('../models/deliveryMan.model.js', () => {
    const mockModel = jest.fn();
    mockModel.find = jest.fn();
    mockModel.findById = jest.fn();
    mockModel.findByIdAndUpdate = jest.fn();
    mockModel.findOne = jest.fn();
    return { DeliveryManModel: mockModel };
});

jest.unstable_mockModule('../models/order.model.js', () => ({
    OrderModel: {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOne: jest.fn(),
    },
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        genSalt: jest.fn().mockResolvedValue('salt'),
        hash: jest.fn().mockResolvedValue('hashedPassword'),
    },
}));

// Dynamic imports
const { createDeliveryMan, getPendingOrders, acceptOrder } = await import('../controllers/delivery.controller.js');
const { DeliveryManModel } = await import('../models/deliveryMan.model.js');
const { OrderModel } = await import('../models/order.model.js');

describe('Delivery Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks(); //resets calls/implementations on all mocks so tests are isolated
    });

    describe('createDeliveryMan', () => {
        it('should create a new delivery man successfully', async () => {
            req.body = {
                name: 'John Doe',
                phone: '01234567890',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };

            const mockSave = jest.fn().mockResolvedValue({
                _doc: {
                    name: 'John Doe',
                    phone: '01234567890',
                    email: 'john@example.com',
                    password: 'hashedPassword',
                    confirmPassword: 'hashedPassword',
                    _id: 'deliveryManId',
                },
            });

            // Mock the constructor implementation
            DeliveryManModel.mockImplementation(() => ({
                save: mockSave,
                _doc: {
                    name: 'John Doe',
                    phone: '01234567890',
                    email: 'john@example.com',
                    password: 'hashedPassword',
                    confirmPassword: 'hashedPassword',
                    _id: 'deliveryManId',
                }
            }));

            await createDeliveryMan(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                name: 'John Doe',
                email: 'john@example.com',
            }));
        });

        it('should return 400 if passwords do not match', async () => {
            req.body = {
                name: 'John Doe',
                phone: '01234567890',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password456',
            };

            await createDeliveryMan(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Passwords do not match' });
        });

        it('should return 400 if phone number is not 11 digits', async () => {
            req.body = {
                name: 'John Doe',
                phone: '123',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };

            await createDeliveryMan(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Phone number must be 11 digits long' });
        });
    });

    describe('getPendingOrders', () => {
        it('should return a list of pending orders', async () => {
            const mockOrders = [
                { _id: 'order1', status: 'pending' },
                { _id: 'order2', status: 'pending' },
            ];

            OrderModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockOrders),
                }),
            });

            await getPendingOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('should handle errors', async () => {
            const errorMessage = 'Database error';
            OrderModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockRejectedValue(new Error(errorMessage)),
                }),
            });

            await getPendingOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });

    describe('acceptOrder', () => {
        it('should accept an order successfully', async () => {
            req.params.orderId = 'orderId';
            req.user.id = 'deliveryManId';

            const mockDeliveryMan = {
                _id: 'deliveryManId',
                status: 'available',
                save: jest.fn(),
            };

            const mockOrder = {
                _id: 'orderId',
                status: 'onTheWay',
                deliveryManId: 'deliveryManId',
            };

            DeliveryManModel.findById.mockResolvedValue(mockDeliveryMan);
            OrderModel.findByIdAndUpdate.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrder),
            });

            await acceptOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Order accepted', order: mockOrder });
            expect(mockDeliveryMan.status).toBe('busy');
            expect(mockDeliveryMan.currentOrderId).toBe('orderId');
        });

        it('should return 404 if delivery man not found', async () => {
            req.params.orderId = 'orderId';
            req.user.id = 'deliveryManId';

            DeliveryManModel.findById.mockResolvedValue(null);

            await acceptOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Delivery man not found' });
        });

        it('should return 400 if delivery man is already busy', async () => {
            req.params.orderId = 'orderId';
            req.user.id = 'deliveryManId';

            const mockDeliveryMan = {
                _id: 'deliveryManId',
                status: 'busy',
            };

            DeliveryManModel.findById.mockResolvedValue(mockDeliveryMan);

            await acceptOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'You already have an active delivery' });
        });
    });
});
