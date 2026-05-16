// User Requirement 3:  Authenticated users assigned as a team leader should be able to assign a team leader for a project

import { describe, jest, test } from "@jest/globals";

jest.unstable_mockModule('../models/projectModels.js', () => ({
    ...jest.requireActual('../models/projectModels.js'),
    putTeamLeader: jest.fn(),
}));

describe('updateTeamLeader', () => {
    test('Should call the putTeamLeader() function and return a successful response', async () => {
        const { updateTeamLeader } = await import('../controllers/projectControllers.js');
        const projectModels = await import('../models/projectModels.js');
        projectModels.putTeamLeader.mockResolvedValue({ rows: [{newTeamLeader: "new team leader"}] });

        const req = {
            body: {
                newLeaderId: "new leader ID",
                projectId: "project ID"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateTeamLeader(req, res, next);

        expect(projectModels.putTeamLeader).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "The team leader has been changed"
        });

        projectModels.putTeamLeader.mockReset();
    });

    test('Should send the correct response when there is no request body', async () => {
        const { updateTeamLeader } = await import('../controllers/projectControllers.js');
        const projectModels = await import('../models/projectModels.js');

        const req = {}
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateTeamLeader(req, res, next);

        expect(projectModels.putTeamLeader).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No request body"
        });

        projectModels.putTeamLeader.mockReset();
    });

    test('Should send the correct response when there is no new team leader ID is provided', async () => {
        const { updateTeamLeader } = await import('../controllers/projectControllers.js');
        const projectModels = await import('../models/projectModels.js');

        const req = {
            body: {
                projectId: "project ID"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateTeamLeader(req, res, next);

        expect(projectModels.putTeamLeader).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Missing newLeaderId"
        });

        projectModels.putTeamLeader.mockReset();
    });

    test('Should send the correct response when there is no project ID is provided', async () => {
        const { updateTeamLeader } = await import('../controllers/projectControllers.js');
        const projectModels = await import('../models/projectModels.js');

        const req = {
            body: {
                newLeaderId: "new leader ID"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateTeamLeader(req, res, next);

        expect(projectModels.putTeamLeader).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Missing projectId"
        });

        projectModels.putTeamLeader.mockReset();
    });

    test('Should send the correct response when there is no matching project ID', async () => {
        const { updateTeamLeader } = await import('../controllers/projectControllers.js');
        const projectModels = await import('../models/projectModels.js');
        projectModels.putTeamLeader.mockResolvedValue({ rows: [] });

        const req = {
            body: {
                newLeaderId: "new leader ID",
                projectId: "project ID"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateTeamLeader(req, res, next);

        expect(projectModels.putTeamLeader).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Project not found"
        });

        projectModels.putTeamLeader.mockReset();
    });

    test('Should call the putTeamLeader() function and return a successful response', async () => {
        const { updateTeamLeader } = await import('../controllers/projectControllers.js');
        const projectModels = await import('../models/projectModels.js');

        // mock model to give error
        projectModels.putTeamLeader.mockImplementation(() => {
            throw new Error('DB Error');
        });

        const req = {
            body: {
                newLeaderId: "new leader ID",
                projectId: "project ID"
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateTeamLeader(req, res, next);

        expect(projectModels.putTeamLeader).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Database error"
        });

        projectModels.putTeamLeader.mockReset();
    });
});