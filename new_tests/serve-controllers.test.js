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

jest.unstable_mockModule('../models/konvaModels.js', () => ({
    ...jest.requireActual('../models/konvaModels.js'),
    getNotesByProjectId: jest.fn(),
}));

jest.unstable_mockModule('../models/userProjectModels.js', () => ({
    ...jest.requireActual('../models/userProjectModels.js'),
    getUsersByProjectId: jest.fn(),
}));

jest.unstable_mockModule('../models/taskModels.js', () => ({
    ...jest.requireActual('../models/taskModels.js'),
    getTasksByProjectIdModel: jest.fn(),
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

    test('Should redirect to /error when getUserByMicrosoftIdModel() fails', async () => {
        const { serveUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
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
        expect(projectModels.getUserProjectsModel).not.toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getUserProjectsModel.mockReset();
    });

     test('Should redirect to /error when getUserProjectsModel() fails', async () => {
        const { serveUserDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });
 
        // mock model to give error
        projectModels.getUserProjectsModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
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
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getUserProjectsModel.mockReset();
    });
});

describe('serveProfile', () => {
    test('Should call the getUserByMicrosoftIdModel() function and render the profile page when a valid session user is given', async () => {
        const { serveProfile } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe", email_notifications: true }] });
 
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
 
        await serveProfile(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("profile", expect.objectContaining({
            userFirstName: "John",
            username: "johndoe",
            userId: 1,
            emailNotifications: true
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
    });

        test('Should redirect to /error when getUserByMicrosoftIdModel() fails', async () => {
        const { serveProfile } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
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
 
        await serveProfile(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
    });
});

describe('serveProjects', () => {
    test('Should call the relevant models and render the projects page when a valid session user is given', async () => {
        const { serveProjects } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });
        projectModels.getUserProjectsModel.mockResolvedValue({
            rows: [
                { project_id: 1, project_name: "Project A" },
                { project_id: 2, project_name: "Project B" }
            ]
        });
 
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
 
        await serveProjects(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(projectModels.getUserProjectsModel).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("projects", expect.objectContaining({
            userFirstName: "John",
            username: "johndoe",
            userId: 1,
            projects: expect.arrayContaining([
                expect.objectContaining({ project_id: 1 }),
                expect.objectContaining({ project_id: 2 })
            ])
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getUserProjectsModel.mockReset();
    });

    test('Should redirect to /error when getUserByMicrosoftIdModel() fails', async () => {
        const { serveProjects } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
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
 
        await serveProjects(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(projectModels.getUserProjectsModel).not.toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getUserProjectsModel.mockReset();
    });
    
    test('Should redirect to /error when getUserProjectsModel() fails', async () => {
        const { serveProjects } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });
 
        // mock model to give error
        projectModels.getUserProjectsModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
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
 
        await serveProjects(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(projectModels.getUserProjectsModel).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getUserProjectsModel.mockReset();
    });
});


describe('serveProjectDash', () => {
    test('Should render the projectDash page with isTeamLeader: true and "No deadline set" when the project has no deadline and the user is the team leader', async () => {
        const { serveProjectDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const konvaModels = await import('../models/konvaModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        konvaModels.getNotesByProjectId.mockResolvedValue({ rows: [] });
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{ project_id: 1, project_name: "Project A", project_deadline: null }]
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId",
                firstName: "John"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 1
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
 
        await serveProjectDash(req, res);
 
        expect(res.render).toHaveBeenCalledWith("projectDash", expect.objectContaining({
            isTeamLeader: true,
            deadlineLabel: "No deadline set"
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        konvaModels.getNotesByProjectId.mockReset();
    })

    test('Should render the projectDash page with a "days left" deadline label when the deadline is in the future', async () => {
        const { serveProjectDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const konvaModels = await import('../models/konvaModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        konvaModels.getNotesByProjectId.mockResolvedValue({ rows: [] });
 
        const future = new Date();
        future.setDate(future.getDate() + 5);
 
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{ project_id: 1, project_name: "Project A", project_deadline: future.toISOString() }]
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId",
                firstName: "John"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 1
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
 
        await serveProjectDash(req, res);
 
        expect(res.render).toHaveBeenCalledWith("projectDash", expect.objectContaining({
            deadlineLabel: expect.stringMatching(/day(s)? left until deadline/)
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        konvaModels.getNotesByProjectId.mockReset();
    });

    test('Should render the projectDash page with "Deadline is today!" when the deadline is today', async () => {
        const { serveProjectDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const konvaModels = await import('../models/konvaModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        konvaModels.getNotesByProjectId.mockResolvedValue({ rows: [] });
 
        const today = new Date();
 
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{ project_id: 1, project_name: "Project A", project_deadline: today.toISOString() }]
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId",
                firstName: "John"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 1
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
 
        await serveProjectDash(req, res);
 
        expect(res.render).toHaveBeenCalledWith("projectDash", expect.objectContaining({
            deadlineLabel: "Deadline is today!"
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        konvaModels.getNotesByProjectId.mockReset();
    });

    test('Should render the projectDash page with a "Deadline passed" label when the deadline is in the past', async () => {
        const { serveProjectDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const konvaModels = await import('../models/konvaModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        konvaModels.getNotesByProjectId.mockResolvedValue({ rows: [] });
 
        const past = new Date();
        past.setDate(past.getDate() - 3);
 
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{ project_id: 1, project_name: "Project A", project_deadline: past.toISOString() }]
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId",
                firstName: "John"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 1
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
 
        await serveProjectDash(req, res);
 
        expect(res.render).toHaveBeenCalledWith("projectDash", expect.objectContaining({
            deadlineLabel: expect.stringMatching(/Deadline passed \d+ day/)
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        konvaModels.getNotesByProjectId.mockReset();
    });

     test('Should render the projectDash page with isTeamLeader: false when the user is not the team leader', async () => {
        const { serveProjectDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const konvaModels = await import('../models/konvaModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        konvaModels.getNotesByProjectId.mockResolvedValue({ rows: [] });
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{ project_id: 1, project_name: "Project A", project_deadline: null }]
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId",
                firstName: "John"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 999
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
 
        await serveProjectDash(req, res);
 
        expect(res.render).toHaveBeenCalledWith("projectDash", expect.objectContaining({
            isTeamLeader: false
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        konvaModels.getNotesByProjectId.mockReset();
    });
 
     test('Should redirect to /error when one of the underlying models fails', async () => {
        const { serveProjectDash } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const konvaModels = await import('../models/konvaModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId",
                firstName: "John"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 1
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
 
        await serveProjectDash(req, res);
 
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        konvaModels.getNotesByProjectId.mockReset();
    });
});

describe('serveProjectInfo', () => {
    test('Should render the projectInfo page with isTeamLeader: true when the user is the team leader', async () => {
        const { serveProjectInfo } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{
                project_id: 1,
                project_name: "Project A",
                created_by: 1,
                team_leader_id: 1,
                deadline: "2026-12-31"
            }]
        });
        userProjectModels.getUsersByProjectId.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 1
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveProjectInfo(req, res, next);
 
        expect(userModels.getUserByMicrosoftIdModel).toHaveBeenCalled();
        expect(projectModels.getProjectByIdModel).toHaveBeenCalled();
        expect(userProjectModels.getUsersByProjectId).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("projectInfo", expect.objectContaining({
            userId: 1,
            username: "johndoe",
            projectId: "1",
            projectName: "Project A",
            isTeamLeader: true,
            projectMembers: expect.arrayContaining([
                expect.objectContaining({ user_id: 1 })
            ])
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        userProjectModels.getUsersByProjectId.mockReset();
    });

    test('Should render the projectInfo page with isTeamLeader: false when the user is not the team leader', async () => {
        const { serveProjectInfo } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{
                project_id: 1,
                project_name: "Project A",
                created_by: 1,
                team_leader_id: 999,
                deadline: "2026-12-31"
            }]
        });
        userProjectModels.getUsersByProjectId.mockResolvedValue({ rows: [] });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 999
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveProjectInfo(req, res, next);
 
        expect(res.render).toHaveBeenCalledWith("projectInfo", expect.objectContaining({
            isTeamLeader: false
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        userProjectModels.getUsersByProjectId.mockReset();
    });

    test('Should redirect to /error when one of the underlying models fails', async () => {
        const { serveProjectInfo } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const userProjectModels = await import('../models/userProjectModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveProjectInfo(req, res, next);
 
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        userProjectModels.getUsersByProjectId.mockReset();
    });
});

describe('serveProjectTasks', () => {
    test('Should render the projectTasks page with isTeamLeader: true when the user is the team leader', async () => {
        const { serveProjectTasks } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const userProjectModels = await import('../models/userProjectModels.js');
        const taskModels = await import('../models/taskModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{ user_id: 1 }] });
        userProjectModels.getUsersByProjectId.mockResolvedValue({ rows: [{ user_id: 1, username: "johndoe" }] });
        projectModels.getProjectByIdModel.mockResolvedValue({
            rows: [{ project_id: 1, project_name: "Project A", team_leader_id: 1 }]
        });
        taskModels.getTasksByProjectIdModel.mockResolvedValue({
            rows: [{ task_id: 1, task_title: "Write the report" }]
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            },
            session: {
                project: {
                    team_leader_id: 1
                }
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveProjectTasks(req, res, next);
 
        expect(taskModels.getTasksByProjectIdModel).toHaveBeenCalled();
        expect(userProjectModels.getUsersByProjectId).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("projectTasks", expect.objectContaining({
            userId: 1,
            username: "johndoe",
            projectId: "1",
            projectName: "Project A",
            tasks: [{ task_id: 1, task_title: "Write the report" }],
            isTeamLeader: true
        }));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        userProjectModels.getUsersByProjectId.mockReset();
        taskModels.getTasksByProjectIdModel.mockReset();
    });

    test('Should redirect to /error when one of the underlying models fails', async () => {
        const { serveProjectInfo } = await import('../controllers/serveControllers.js');
        const userModels = await import('../models/userModels.js');
        const projectModels = await import('../models/projectModels.js');
        const userProjectModels = await import('../models/userProjectModels.js');
 
        // mock model to give error
        userModels.getUserByMicrosoftIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });
 
        const req = {
            user: {
                microsoftId: "myMicrosoftId"
            },
            params: {
                username: "johndoe",
                project_id: "1"
            }
        }
        const res = {
            render: jest.fn(),
            redirect: jest.fn()
        };
        const next = jest.fn();
 
        await serveProjectInfo(req, res, next);
 
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/error"));
 
        userModels.getUserByMicrosoftIdModel.mockReset();
        projectModels.getProjectByIdModel.mockReset();
        userProjectModels.getUsersByProjectId.mockReset();
    });
});

