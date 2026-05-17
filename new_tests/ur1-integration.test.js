// User Requirement 1:  Users should be able to authenticate with their Microsoft account

import { jest, describe, test, expect } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";
import { readFile } from "fs/promises";

beforeEach(async () => {
    await query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
    const seed = await readFile("./db/seed_test.sql", "utf8");
    await query(seed);
});

describe("addUser", () => {
    test("Should add user successfully when authenticated", async () => {
        jest.resetModules();

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

    test("Should fail when user is not authenticated", async () => {
        jest.resetModules();

        jest.unstable_mockModule("../utils/auth.js", () => ({
            default: (app) => {
                app.use((req, res, next) => {
                    req.user = undefined;
                    next();
                });
            }
        }));

        const { default: app } = await import("../app.js");

        const response = await request(app)
            .post("/api/users")
            .send();

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("No session user");
    });
});

describe("updateUsername", () => {
    test("Should change username successfully when authenticated", async () => {
        jest.resetModules();

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

        const { default: app } = await import("../app.js");

        // seed a user so the username check doesn't fail on a missing row
        await query(
            `INSERT INTO users (microsoft_id, user_first_name, user_last_name, user_email, username)
             VALUES ('ms-1', 'Test', 'User', 'test@example.com', 'ms-1')`
        );

        const response = await request(app)
            .put("/api/users")
            .send({ usernameValue: "newusername" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Your username has been changed :)");

        const dbResult = await query(
            `SELECT username FROM users WHERE microsoft_id = 'ms-1'`
        );

        expect(dbResult.rows.length).toBe(1);
        expect(dbResult.rows[0].username).toBe("newusername");
    });

    test("Should fail to change username when unauthenticated", async () => {
        jest.resetModules();

        jest.unstable_mockModule("../utils/auth.js", () => ({
            default: (app) => {
                app.use((req, res, next) => {
                    req.user = undefined;
                    next();
                });
            }
        }));

        const { default: app } = await import("../app.js");

        const response = await request(app)
            .put("/api/users")
            .send({ usernameValue: "newusername" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("No session user");
    });
});