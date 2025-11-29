import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/menuItem.model.js', () => {
    const mockModel = jest.fn();
    mockModel.find = jest.fn();
    return { ItemModel: mockModel };
});

jest.unstable_mockModule('../models/review.model.js', () => {
    const mockModel = jest.fn();
    mockModel.find = jest.fn();
    return { reviewModel: mockModel };
});

const { createMenuItem, getMenuItems } = await import('../controllers/menu.controller.js');
const { ItemModel } = await import('../models/menuItem.model.js');
const { reviewModel } = await import('../models/review.model.js');

describe('Menu Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {}, file: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('createMenuItem', () => {
        it('should create a new menu item successfully', async () => {
            req.body = {
                name: 'Pizza',
                description: 'Delicious pizza',
                price: 10,
                categoryId: 'cat123'
            };
            req.file = { filename: 'pizza.jpg' };

            const mockSave = jest.fn().mockResolvedValue({});
            ItemModel.mockImplementation(() => ({
                save: mockSave,
                ...req.body,
                image: '/uploads/pizza.jpg',
                _doc: { ...req.body, image: '/uploads/pizza.jpg' }
            }));

            await createMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Pizza',
                image: '/uploads/pizza.jpg'
            }));
        });

        it('should handle errors during creation', async () => {
            req.body = { name: 'Pizza' };
            const errorMessage = 'Database error';

            ItemModel.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error(errorMessage))
            }));

            await createMenuItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });

    describe('getMenuItems', () => {
        it('should return menu items with average rating', async () => {
            const mockItems = [
                { _id: 'item1', _doc: { name: 'Pizza' } },
                { _id: 'item2', _doc: { name: 'Burger' } }
            ];

            ItemModel.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockItems)
            });

            reviewModel.find.mockImplementation((query) => {
                if (query.menuItemId === 'item1') {
                    return Promise.resolve([{ rating: 5 }, { rating: 4 }]);
                }
                return Promise.resolve([]);
            });

            await getMenuItems(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([
                expect.objectContaining({ name: 'Pizza', averageRating: '4.5', reviewCount: 2 }),
                expect.objectContaining({ name: 'Burger', averageRating: '0.0', reviewCount: 0 })
            ]);
        });

        it('should return 404 if no items found', async () => {
            ItemModel.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await getMenuItems(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "No items found" });
        });

        it('should handle errors', async () => {
            const errorMessage = 'Database error';
            ItemModel.find.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error(errorMessage))
            });

            await getMenuItems(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
        });
    });
});
