import { jest } from "@jest/globals";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";

jest.unstable_mockModule('../models/userModels.js', () => ({
    ...jest.requireActual('../models/userModels.js'),
    getUserByMicrosoftIdModel: jest.fn()
}));

test('Should fail after error from model to retrieve user by Microsoft ID', async () => {
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