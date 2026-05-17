import { describe, jest, test } from "@jest/globals";

jest.unstable_mockModule('../models/userModels.js', () => ({
    ...jest.requireActual('../models/userModels.js'),
    getUserByMicrosoftIdModel: jest.fn(),
}));


describe('redirectUserDash', () => {
    test('Should call the getUserByMicrosoftIdModel() function and redirect to /:username when a valid Microsoft ID is given', async () => {
        const { redirectUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });

        const req = {
            user: {
                microsoftId: "myMicrosoftId"
            }
        }
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();

        await redirectUserDash(req, res, next);

        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/johndoe");

        userModels.getUserByMicrosoftIdModel.mockReset();
    });

});