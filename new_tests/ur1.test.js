// User Requirement 1:  Users should be able to authenticate with their Microsoft account

import app from "../app.js";
import request from "supertest";
import { query } from "../db/connection.js";
import { jest } from "@jest/globals";
import { checkIfLoggedIn } from "../controllers/authControllers.js";

describe('checkIfLoggedIn', () => {
    test("Should call the 'next()' function if no valid session user", async () => {
        const req = { user: undefined };
        const res = { redirect: jest.fn() };
        const next = jest.fn();

        await checkIfLoggedIn(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });
})
