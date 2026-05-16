// User Requirement 1:  Users should be able to authenticate with their Microsoft account

import { describe, jest, test } from "@jest/globals";

jest.unstable_mockModule('../models/userModels.js', () => ({
    ...jest.requireActual('../models/userModels.js'),
    postUserModel: jest.fn(),
    getUserByMicrosoftIdModel: jest.fn(),
    putUsernameByIdModel: jest.fn(),
    getUserByUsernameModel: jest.fn(),
}));

describe('checkIfLoggedIn', () => {
    test("Should call the 'next()' function if no valid session user", async () => {
        const { checkIfLoggedIn } = await import('../controllers/authControllers.js');
        const req = { user: undefined };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test("Should call the 'next()' function if session user has no access token", async () => {
        const { checkIfLoggedIn } = await import('../controllers/authControllers.js');
        const req = { user: {accessToken: undefined} };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test("Should call the 'next()' function if valid user in session but no matching user in database", async () => {
        const { checkIfLoggedIn } = await import('../controllers/authControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [] });

        const req = { user: {
            microsoftId: "ms-not-johndoe",
            accessToken: "ms-access-token"
        } };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test("Should call the 'res.redirect(/:username)' function if valid user in session and matching user in database", async () => {
        const { checkIfLoggedIn } = await import('../controllers/authControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{user: "valid user"}] });

        const req = { user: {
            microsoftId: "ms-johndoe",
            accessToken: "ms-access-token"
        } };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalled();
    });

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
    test("Should move to the next middleware function if there is a valid user in session and database", async () => {
        const { checkIfLoggedInRedirect } = await import('../controllers/authControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [{user: "valid user"}] });

        const req = { user: {microsoftId: "ms-johndoe"} };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedInRedirect(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test("Should call the 'res.redirect(/)' function if no valid session user", async () => {
        const { checkIfLoggedInRedirect } = await import('../controllers/authControllers.js');
        const req = { user: undefined };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedInRedirect(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith("/");
        expect(next).not.toHaveBeenCalled();
    });

    test("Should call the 'res.redirect(/)' function if valid user in session but no matching user in database", async () => {
        const { checkIfLoggedInRedirect } = await import('../controllers/authControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByMicrosoftIdModel.mockResolvedValue({ rows: [] });

        const req = { user: {microsoftId: "ms-not-johndoe"} };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedInRedirect(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith("/");
        expect(next).not.toHaveBeenCalled();
    });

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

describe('checkIfLoggedInCalendar', () => {
    test("Should move onto the next middleware function when user is authenticated", async () => {
        const { checkIfLoggedInCalendar } = await import('../controllers/authControllers.js');
        const req = { isAuthenticated: jest.fn().mockReturnValue(true) };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkIfLoggedInCalendar(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test("Should send an error code and message if user not authenticated", async () => {
        const { checkIfLoggedInCalendar } = await import('../controllers/authControllers.js');
        const req = { isAuthenticated: jest.fn().mockReturnValue(false) };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const response = await checkIfLoggedInCalendar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated" });
    });
});

describe('signOut', () => {
    test('Should hand control over to Passport.js when route is called', async() => {
        const { signOut } = await import('../controllers/authControllers.js');
        const req = { logout: jest.fn() };
        const res = {};
        const next = jest.fn();

        signOut(req, res, next);

        expect(req.logout).toHaveBeenCalledWith(next);
    });
});

describe('setJustAuthenticatedFlag', () => {
    test('Should set justAuthenticated flag to True', async () => {
        const { setJustAuthenticatedFlag } = await import('../controllers/authControllers.js');
        const req = { session: {} };
        const res = {};
        const next = jest.fn();

        setJustAuthenticatedFlag(req, res, next);

        expect(req.session.justAuthenticated).toBe(true);
        expect(next).toHaveBeenCalled();
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

    test('Should return the correct response when postUserModel() fails', async () => {
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
});

describe('updateUsername', () => {
    test('Should call the putUsernameByIdModel() function if valid username given', async () => {
        const { updateUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            user: { microsoftId: '123' },
            body: { usernameValue: 'username123' }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateUsername(req, res, next);

        expect(userModels.putUsernameByIdModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Your username has been changed :)"
        });

        userModels.putUsernameByIdModel.mockReset();
    });

    test('Should return the correct response when no session user exists', async () => {
        const { updateUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            body: { usernameValue: 'username123' }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateUsername(req, res, next);

        expect(userModels.putUsernameByIdModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No session user"
        });

        userModels.putUsernameByIdModel.mockReset();
    });

    test('Should return the correct response when no request body is sent', async () => {
        const { updateUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            user: { microsoftId: '123' }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateUsername(req, res, next);

        expect(userModels.putUsernameByIdModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No request body"
        });

        userModels.putUsernameByIdModel.mockReset();
    });

    test('Should return the correct response when no username is given to the body', async () => {
        const { updateUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            user: { microsoftId: '123' },
            body: {}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateUsername(req, res, next);

        expect(userModels.putUsernameByIdModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No given username"
        });

        userModels.putUsernameByIdModel.mockReset();
    });

    test('Should return the correct response when username provided is too short', async () => {
        const { updateUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            user: { microsoftId: '123' },
            body: { usernameValue: 'no'}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateUsername(req, res, next);

        expect(userModels.putUsernameByIdModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Username has an invalid length"
        });

        userModels.putUsernameByIdModel.mockReset();
    });

    test('Should return the correct response when username provided is too long', async () => {
        const { updateUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            user: { microsoftId: '123' },
            body: { usernameValue: 'abcdefghijklmnopqrstuvwxyz'}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateUsername(req, res, next);

        expect(userModels.putUsernameByIdModel).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Username has an invalid length"
        });

        userModels.putUsernameByIdModel.mockReset();
    });

    test('Should return the correct response when putUsernameByIdModel() fails', async () => {
        const { updateUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        // mock model to give error
        userModels.putUsernameByIdModel.mockImplementation(() => {
            throw new Error('DB Error');
        });

        const req = {
            user: { microsoftId: '123' },
            body: { usernameValue: 'jay'}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await updateUsername(req, res, next);

        expect(userModels.putUsernameByIdModel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Database error"
        });

        userModels.putUsernameByIdModel.mockReset();
    });
});

describe('checkValidUsername', () => {
    test('Should call the getUserByUsernameModel() and next() functions if valid username given', async () => {
        const { checkValidUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByUsernameModel.mockResolvedValue({ rows: [] });

        const req = {
            body: { usernameValue: 'username123' }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkValidUsername(req, res, next);

        expect(userModels.getUserByUsernameModel).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();

        userModels.getUserByUsernameModel.mockReset();
    });

    test('Should return the correct response when no request body is sent', async () => {
        const { checkValidUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {}
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkValidUsername(req, res, next);

        expect(userModels.getUserByUsernameModel).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No request body"
        });

        userModels.getUserByUsernameModel.mockReset();
    });

    test('Should return the correct response when no username is given to the body', async () => {
        const { checkValidUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            body: {}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkValidUsername(req, res, next);

        expect(userModels.getUserByUsernameModel).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "No given username"
        });

        userModels.getUserByUsernameModel.mockReset();
    });

    test('Should return the correct response when username provided is too short', async () => {
        const { checkValidUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            body: { usernameValue: 'no'}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkValidUsername(req, res, next);

        expect(userModels.getUserByUsernameModel).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Username has an invalid length"
        });

        userModels.getUserByUsernameModel.mockReset();
    });

    test('Should return the correct response when username provided is too long', async () => {
        const { checkValidUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');

        const req = {
            body: { usernameValue: 'abcdefghijklmnopqrstuvwxyz'}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkValidUsername(req, res, next);

        expect(userModels.getUserByUsernameModel).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Username has an invalid length"
        });

        userModels.getUserByUsernameModel.mockReset();
    });

    test('Should return the correct response if the username is already taken', async () => {
        const { checkValidUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');
        userModels.getUserByUsernameModel.mockResolvedValue({ rows: [{username: "user exists!"}] });

        const req = {
            body: { usernameValue: 'username123' }
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkValidUsername(req, res, next);

        expect(userModels.getUserByUsernameModel).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalledWith();
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Username already taken!"
        });

        userModels.getUserByUsernameModel.mockReset();
    });

    test('Should return the correct response when getUserByUsername() fails', async () => {
        const { checkValidUsername } = await import('../controllers/userControllers.js');
        const userModels = await import('../models/userModels.js');
        

        // mock model to give error
        userModels.getUserByUsernameModel.mockImplementation(() => {
            throw new Error('DB Error');
        });

        const req = {
            body: { usernameValue: 'jay'}
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await checkValidUsername(req, res, next);

        expect(userModels.getUserByUsernameModel).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Database error"
        });

        userModels.getUserByUsernameModel.mockReset();
    });
});