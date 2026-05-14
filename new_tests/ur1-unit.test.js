// User Requirement 1:  Users should be able to authenticate with their Microsoft account

import app from "../app.js";
import { jest, test } from "@jest/globals";
import {
    checkIfLoggedIn,
    checkIfLoggedInRedirect,
    checkIfLoggedInCalendar
} from "../controllers/authControllers.js";

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

    test("Should call the 'res.redirect(/)' function if no valid session user", async () => {
        const req = { user: undefined };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedInRedirect(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith("/");
        expect(next).not.toHaveBeenCalled();
    });

    test("Should call the 'res.redirect(/)' function if valid user in session but no matching user in database", async () => {
        const req = { user: {microsoftId: "ms-not-johndoe"} };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedInRedirect(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith("/");
        expect(next).not.toHaveBeenCalled();
    });
});

describe('checkIfLoggedInCalendar', () => {
    test("Should move onto the next middleware function when user is authenticated", async () => {
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
})
