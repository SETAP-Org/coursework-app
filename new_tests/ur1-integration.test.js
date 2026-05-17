// User Requirement 1:  Users should be able to authenticate with their Microsoft account

import { jest, describe, test, expect } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";

jest.unstable_mockModule("../utils/auth.js", () => ({
    default: (app) => {
        app.use((req, res, next) => {
            req.user = {
                microsoftId: "ms-1",
                firstName: "Test",
                lastName: "User",
                email: "test@example.com"
            };
            next();
        });
    }
}));

beforeEach(async () => {
    await query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
});

describe("addUser", () => {
    test("Should add user successfully when authenticated", async () => {
        const { default: app } = await import("../app.js");

        const response = await request(app)
            .post("/api/users")
            .send();

        // expect from http
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User added successfully!");
        expect(response.body.user).toBeDefined();

        const insertedUser = response.body.user;

        // database query
        const dbResult = await query(
            `SELECT * FROM users WHERE user_id = $1`,
            [insertedUser.user_id]
        );

        // expect from database
        expect(dbResult.rows.length).toBe(1);
        expect(dbResult.rows[0].user_email).toBeDefined();
    });
});