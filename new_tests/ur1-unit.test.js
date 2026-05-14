// User Requirement 1:  Users should be able to authenticate with their Microsoft account

import app from "../app.js";
import { jest } from "@jest/globals";
import { checkIfLoggedIn, checkIfLoggedInRedirect } from "../controllers/authControllers.js";

describe('checkIfLoggedIn', () => {
    test("Should call the 'next()' function if no valid session user", async () => {
        const req = { user: undefined };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test("Should call the 'next()' function if session user has no access token", async () => {
        const req = { user: {accessToken: undefined} };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test("Should call the 'next()' function if valid user in session but no matching user in database", async () => {
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
        const req = { user: {
            microsoftId: "ms-johndoe",
            accessToken: "ms-access-token"
        } };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/jdoe");
    });
});

describe('checkIfLoggedInRedirect', () => {
    test("Should move to the next middleware function if there is a valid user in session and database", async () => {
        const req = { user: {microsoftId: "ms-johndoe"} };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedInRedirect(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });
});
