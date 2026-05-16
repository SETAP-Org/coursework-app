// User Requirement 13:  Authenticated users should be able to view notifications from anywhere inside the app

import { describe, jest, test } from "@jest/globals";

jest.unstable_mockModule('../models/notificationModels.js', () => ({
    ...jest.requireActual('../models/notificationModels.js'),
    getNotificationsModel: jest.fn(),
    deleteNotificationModel: jest.fn()
}));

describe('fetchNotificationsByUserId', () => {
    test('Should call the getNotificationsModel() function and return a successful response', async () => {
        const { fetchNotificationsByUserId } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');
        notificationModels.getNotificationsModel.mockResolvedValue({ rows: [] });

        const req = {
            params: {
                user_id: "my user id"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await fetchNotificationsByUserId(req, res, next);

        expect(notificationModels.getNotificationsModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            notifications: []
        });

        notificationModels.getNotificationsModel.mockReset();
    });

    test('Should send the correct response when no request parameters are provided', async () => {
        const { fetchNotificationsByUserId } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');

        const req = {}
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await fetchNotificationsByUserId(req, res, next);

        expect(notificationModels.getNotificationsModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No request parameters"
        });

        notificationModels.getNotificationsModel.mockReset();
    });

    test('Should send the correct response when no user ID is provided', async () => {
        const { fetchNotificationsByUserId } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');
        notificationModels.getNotificationsModel.mockResolvedValue({ rows: [] });

        const req = {
            params: {}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await fetchNotificationsByUserId(req, res, next);

        expect(notificationModels.getNotificationsModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No user ID provided"
        });

        notificationModels.getNotificationsModel.mockReset();
    });

    test('Should send the correct response when the getNotificationsModel() fails', async () => {
        const { fetchNotificationsByUserId } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');

        // mock model to give error
        notificationModels.getNotificationsModel.mockImplementation(() => {
            throw new Error('DB Error');
        });

        const req = {
            params: {
                user_id: "my user id"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await fetchNotificationsByUserId(req, res, next);

        expect(notificationModels.getNotificationsModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Database error"
        });

        notificationModels.getNotificationsModel.mockReset();
    });
});

describe('removeNotification', () => {
    test('Should call the deleteNotificationModel() function and return a successful response', async () => {
        const { removeNotification } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');
        notificationModels.deleteNotificationModel.mockResolvedValue({ rows: [{ notification: "deleted notification" }] });

        const req = {
            params: {
                notification_id: "my notification id"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await removeNotification(req, res, next);

        expect(notificationModels.deleteNotificationModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Notification deleted successfully!"
        });

        notificationModels.deleteNotificationModel.mockReset();
    });

    test('Should send the correct response when no request parameters are provided', async () => {
        const { removeNotification } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');
        notificationModels.deleteNotificationModel.mockResolvedValue({ rows: [{ notification: "deleted notification" }] });

        const req = {}
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await removeNotification(req, res, next);

        expect(notificationModels.deleteNotificationModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No request parameters"
        });

        notificationModels.deleteNotificationModel.mockReset();
    });

    test('Should send the corrrect response when no notification ID is provided', async () => {
        const { removeNotification } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');

        const req = {
            params: {}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await removeNotification(req, res, next);

        expect(notificationModels.deleteNotificationModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No notification ID provided"
        });

        notificationModels.deleteNotificationModel.mockReset();
    });

    test('Should send the correct response when no data comes back from the database', async () => {
        const { removeNotification } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');
        notificationModels.deleteNotificationModel.mockResolvedValue({ rows: [] });

        const req = {
            params: {
                notification_id: "my notification id"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await removeNotification(req, res, next);

        expect(notificationModels.deleteNotificationModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Something went wrong"
        });

        notificationModels.deleteNotificationModel.mockReset();
    });

    test('Should send the correct response when deleteNotificationModel() fails', async () => {
        const { removeNotification } = await import('../controllers/notificationControllers.js');
        const notificationModels = await import('../models/notificationModels.js');

        // mock model to give error
        notificationModels.deleteNotificationModel.mockImplementation(() => {
            throw new Error('DB Error');
        });

        const req = {
            params: {
                notification_id: "my notification id"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await removeNotification(req, res, next);

        expect(notificationModels.deleteNotificationModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Database error"
        });

        notificationModels.deleteNotificationModel.mockReset();
    });
});