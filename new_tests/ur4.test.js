// User Requirement 4:  Authenticated users assigned as a team leader should be able to manage members for their projects

import { describe, jest, test } from "@jest/globals";

jest.unstable_mockModule('../models/userModels.js', () => ({
    ...jest.requireActual('../models/userModels.js'),
    getUserByUsernameModel: jest.fn(),
}));

jest.unstable_mockModule('../models/userProjectModels.js', () => ({
    ...jest.requireActual('../models/userProjectModels.js'),
    postUserToProjectModel: jest.fn(),
}));

describe('addUserToProject', () => {
    test('Should call the postUserToProjectModel() function and return a successful response', async () => {
        const { addUserToProject } = await import('../controllers/userProjectControllers.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByUsernameModel.mockResolvedValue({ rows: [{username: "user exists!"}] });

        const req = {
            body: {
                username: 'username123',
                projectId: 'myProjectId'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await addUserToProject(req, res, next);

        expect(userModels.getUserByUsernameModel).toHaveBeenCalled();
        expect(userProjectModels.postUserToProjectModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "User successfully added to the project!"
        });

        userModels.getUserByUsernameModel.mockReset();
        userProjectModels.postUserToProjectModel.mockReset();
    });

    test('Should return the correct response if no request body is attached', async () => {
        const { addUserToProject } = await import('../controllers/userProjectControllers.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        const userModels = await import('../models/userModels.js');

        const req = {}
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await addUserToProject(req, res, next);

        expect(userModels.getUserByUsernameModel).not.toHaveBeenCalled();
        expect(userProjectModels.postUserToProjectModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No request body"
        });

        userModels.getUserByUsernameModel.mockReset();
        userProjectModels.postUserToProjectModel.mockReset();
    });

    test('Should return the correct response if the request body does not contain a project ID', async () => {
        const { addUserToProject } = await import('../controllers/userProjectControllers.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            body: {
                projectId: 'myProjectId'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await addUserToProject(req, res, next);

        expect(userModels.getUserByUsernameModel).not.toHaveBeenCalled();
        expect(userProjectModels.postUserToProjectModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No username provided"
        });

        userModels.getUserByUsernameModel.mockReset();
        userProjectModels.postUserToProjectModel.mockReset();
    });

    test('Should return the correct response if the request body does not contain a username', async () => {
        const { addUserToProject } = await import('../controllers/userProjectControllers.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            body: {
                username: 'username123',
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await addUserToProject(req, res, next);

        expect(userModels.getUserByUsernameModel).not.toHaveBeenCalled();
        expect(userProjectModels.postUserToProjectModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No project ID provided"
        });

        userModels.getUserByUsernameModel.mockReset();
        userProjectModels.postUserToProjectModel.mockReset();
    });

    test('Should return the correct response if username matches no users in the database', async () => {
        const { addUserToProject } = await import('../controllers/userProjectControllers.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByUsernameModel.mockResolvedValue({ rows: [] });

        const req = {
            body: {
                username: 'username123',
                projectId: 'myProjectId'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await addUserToProject(req, res, next);

        expect(userModels.getUserByUsernameModel).toHaveBeenCalled();
        expect(userProjectModels.postUserToProjectModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "User does not exist!"
        });

        userModels.getUserByUsernameModel.mockReset();
        userProjectModels.postUserToProjectModel.mockReset();
    });
});