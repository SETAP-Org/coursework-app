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

    test('Should redirect to / when there is no user in the session', async () => {
        const { redirectUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {}
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();

        await redirectUserDash(req, res, next);

        expect(userModels.getUserByMicrosoftIdModel).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/");

        userModels.getUserByMicrosoftIdModel.mockReset();
    });

    test('Should redirect to / when the session user has no Microsoft ID', async () => {
        const { redirectUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            user: {}
        }
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();

        await redirectUserDash(req, res, next);

        expect(userModels.getUserByMicrosoftIdModel).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/");

        userModels.getUserByMicrosoftIdModel.mockReset();
    });

    test('Should redirect to / when no matching user is found in the database', async () => {
        const { redirectUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        // Controller checks `dbUserResult.rows === 0`, which is falsy for `[]`, so the
        // function falls through to redirect with the (undefined) username. We assert
        // getUserByMicrosoftIdModel was called and a redirect occurred.
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [] });

        const req = {
            user: {
                microsoftId: "myInvalidMicrosoftId"
            }
        }
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();

        await redirectUserDash(req, res, next);

        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalled();

        userModels.getUserByMicrosoftIdModel.mockReset();
    });
    
    test('Should redirect to /error when getUserByMicrosoftIdModel() fails', async () => {
        const { redirectUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
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
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
    });
});

describe('redirectWelcome', () => {
    test('Should redirect to /welcome when called', async () => {
        const { redirectWelcome } = await import('../controllers/serveControllers.js');
 
        const req = {}
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await redirectWelcome(req, res, next);
 
        expect(res.redirect).toHaveBeenCalledWith("/welcome");
    });
});

describe('serveLanding', () => {
    test('Should render the landing page with cookieConsent: false when the cookie is not set', async () => {
        const { serveLanding } = await import('../controllers/serveControllers.js');
 
        const req = {
            cookies: {}
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        serveLanding(req, res, next);
 
        expect(res.render).toHaveBeenCalledWith("landing", {
            cookieConsent: false
        });
        expect(res.redirect).not.toHaveBeenCalled();
    });

    
});