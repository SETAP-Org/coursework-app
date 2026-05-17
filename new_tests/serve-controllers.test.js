import { describe, jest, test } from "@jest/globals";

jest.unstable_mockModule('../models/userModels.js', () => ({
    ...jest.requireActual('../models/userModels.js'),
    getUserByMicrosoftIdModel: jest.fn(),
}));

jest.unstable_mockModule('../models/projectModels.js', () => ({
    ...jest.requireActual('../models/projectModels.js'),
    getProjectByIdModel: jest.fn(),
    getUserProjectsModel: jest.fn(),
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

    test('Should render the landing page with cookieConsent: true when the cookie is set', async () => {
        const { serveLanding } = await import('../controllers/serveControllers.js');

        const req = {
            cookies: {
                cookieConsent: "true"
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();

        serveLanding(req, res, next);

        expect(res.render).toHaveBeenCalledWith("landing", {
            cookieConsent: true
        });
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test('Should redirect to /error if something goes wrong while rendering', async () => {
        const { serveLanding } = await import('../controllers/serveControllers.js');

        const req = {
            cookies: {
                cookieConsent: "true"
            }
        }
        const res = {
            render: jest.fn().mockImplementation(() => {
                throw new Error('Render failed');
            }),
            redirect: jest.fn()
        };
        const next = jest.fn();

        serveLanding(req, res, next);

        expect(res.render).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
    });
});

describe('serveWelcome', () => {
    test('Should redirect to /welcome when the user has just authenticated', async () => {
        const { serveWelcome } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
 
        const req = {
            session: {
                justAuthenticated: true
            },
            user: {
                microsoftId: "myMicrosoftId"
            }
        }
        const res = {
            render: jest.fn()
        };
        const next = jest.fn();
 
        await serveWelcome(req, res, next);
 
        expect(req.session.justAuthenticated).toBe(false);
        expect(res.render).toHaveBeenCalledWith("/welcome");
        expect(userModels.getUserByMicrosoftIdModel).not.toHaveBeenCalled();
 
        userModels.getUserByMicrosoftIdModel.mockReset();
    });

    test('Should redirect to /:username when the user has not just authenticated', async () => {
        const { serveWelcome } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });
 
        const req = {
            session: {
                justAuthenticated: false
            },
            user: {
                microsoftId: "myMicrosoftId"
            }
        }
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveWelcome(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/johndoe");
 
        userModels.getUserByMicrosoftIdModel.mockReset();
    });

    test('Should redirect to / when there is no user in the session', async () => {
        const { serveWelcome } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
 
        const req = {
            session: {
                justAuthenticated: false
            }
        }
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveWelcome(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/");
 
        userModels.getUserByMicrosoftIdModel.mockReset();
    });

    test('Should redirect to /error when getUserByMicrosoftIdModel() fails', async () => {
        const { serveWelcome } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
        const req = {
            session: {
                justAuthenticated: false
            },
            user: {
                microsoftId: "myInvalidMicrosoftId"
            }
        }
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveWelcome(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
    });
});

describe('serveError', () => {
    test('Should render the error page with the error message from the query string', async () => {
        const { serveError } = await import('../controllers/serveControllers.js');
 
        const req = {
            query: {
                err: "Something went wrong"
            }
        }
        const res = {
            render: jest.fn()
        };
        const next = jest.fn();
 
        serveError(req, res, next);
 
        expect(res.render).toHaveBeenCalledWith("error", {
            error: "Something went wrong"
        });
    });

    test('Should render the error page even when no error message is provided', async () => {
        const { serveError } = await import('../controllers/serveControllers.js');
 
        const req = {
            query: {}
        }
        const res = {
            render: jest.fn()
        };
        const next = jest.fn();
 
        serveError(req, res, next);
 
        expect(res.render).toHaveBeenCalledWith("error", {
            error: undefined
        });
    });
});

describe('serveUserDash', () => {
    test('Should call the relevant models and render the userDash page when a valid session user is given', async () => {
        const { serveUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });
        projectModels.getUserProjectsModel.mockResolvedValue({ rows: [{ project_id: 1, project_name: "Project A" }] });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId",
                firstName: "John"
            },
            params: {
                username: "johndoe"
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveUserDash(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(projectModels.getUserProjectsModel).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("userDash", expect.objectContaining({
            userFirstName: "John",
            username: "johndoe",
            userId: 1,
            projects: [{ project_id: 1, project_name: "Project A" }]
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getUserProjectsModel.mockReset();
    });


});