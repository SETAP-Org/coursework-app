import { describe, jest } from "@jest/globals";
// import { getUserByMicrosoftIdModel, postUserModel } from "../models/userModels.js";

jest.unstable_mockModule('../models/userModels.js', () => ({
    ...jest.requireActual('../models/userModels.js'),
    postUserModel: jest.fn(),
    getUserByMicrosoftIdModel: jest.fn()
}));

describe('checkIfLoggedIn', () => {
    test("Should call the 'res.redirect(/error)' function after error from model to retrieve user by Microsoft ID", async () => {
        const { checkIfLoggedIn } = await import('../controllers/authControllers.js');
        const userModels = await import('../models/userModels.js');
        
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
    
        // structuring dummy controller arguments
        const req = { user: {
            microsoftId: "ms-johndoe",
            accessToken: "ms-access-token"
        } };
        const res = { redirect: jest.fn() };
        const next = jest.fn();
    
        await checkIfLoggedIn(req, res, next);
    
        expect(res.redirect).toHaveBeenCalledWith("/error");
        expect(next).not.toHaveBeenCalled();
    
        userModels.getUserByMicrosoftIdModel.mockReset();
    });
});

describe('checkIfLoggedInRedirect', () => {
    test("Should call the 'res.redirect(/error)' function after error from model to retrieve user by Microsoft ID", async () => {
        const { checkIfLoggedInRedirect } = await import('../controllers/authControllers.js');
        const userModels = await import('../models/userModels.js');
        
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
    
        // structuring dummy controller arguments
        const req = { user: {microsoftId: "ms-johndoe"} };
        const res = { redirect: jest.fn() };
        const next = jest.fn();
    
        await checkIfLoggedInRedirect(req, res, next);
    
        expect(res.redirect).toHaveBeenCalledWith("/error");
        expect(next).not.toHaveBeenCalled();
    
        userModels.getUserByMicrosoftIdModel.mockReset();
    });
});

describe('addUser', () => {
    test('Should call the postUserModel if valid user', async () => {
        const { addUser } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            user: {
                microsoftId: '123',
                firstName: 'John',
                lastName: 'Smith',
                email: 'johnsmith@example.com'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        
        await addUser(req, res, next);

        expect(userModels.postUserModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);

        userModels.postUserModel.mockReset();
    });

    test('Should return the correct response when invalid session user', async () => {
        const { addUser } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {}
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        
        await addUser(req, res, next);

        expect(userModels.postUserModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No session user"
        });

        userModels.postUserModel.mockReset();
    });

    test('Should return the correct response when invalid session user', async () => {
        const { addUser } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        // mock model to give error
        userModels.postUserModel.mockImplementation(() => {
            throw new Error('DB Error');
        });

        const req = {
            user: {
                microsoftId: '123',
                firstName: 'John',
                lastName: 'Smith',
                email: 'johnsmith@example.com'
            }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        
        await addUser(req, res, next);

        expect(userModels.postUserModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Database error"
        });

        userModels.postUserModel.mockReset();
    });
})