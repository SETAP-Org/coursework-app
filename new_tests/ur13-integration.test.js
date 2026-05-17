// User Requirement 13: Authenticated users should be able to view notifications from anywhere inside the app

import { server } from "../server.js";
import Client from "socket.io-client";
import { query } from "../db/connection.js";
import { describe, jest, test } from "@jest/globals";

let port;

let aliceId;
let bobId;
let charlieId;
let projectId;

// before each test, start the server and get the user and project data from the database
beforeAll((done) => {
    server.listen(0, async () => {
        port = server.address().port;

        const users = await query(`
            SELECT user_id, username
            FROM users
            WHERE microsoft_id IN ('ms-socket-alice', 'ms-socket-bob', 'ms-socket-charlie)
            ORDER BY username;
        `);

        aliceId = users.rows[0].user_id;
        bobId = users.rows[1].user_id;
        charlieId = users.rows[2].user_id;

        const project = await query(`
            SELECT project_id
            FROM projects
            WHERE project_name = 'Socket Integration Project'
            LIMIT 1;
        `);

        projectId = project.rows[0].project_id;

        done();
    });
});

beforeEach(async () => {
    await query(`TRUNCATE TABLE notifications RESTART IDENTITY CASCADE`);
});

// after each test, close the server
afterAll((done) => {
    server.close(() => done());
});