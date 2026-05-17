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
            WHERE microsoft_id IN ('ms-socket-alice', 'ms-socket-bob', 'ms-socket-charlie')
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

describe("Notification socket", () => {
    test("notifications are delivered and saved in DB", async () => {
        const clientA = new Client(`http://localhost:${port}`);
        const clientB = new Client(`http://localhost:${port}`);

        await Promise.all([
            new Promise(res => clientA.on("connect", res)),
            new Promise(res => clientB.on("connect", res)),
        ]);

        // listen for notification broadcast
        const receivedPromise = new Promise((resolve) => {
            clientB.on("notification", resolve);
        });

        // send notification + capture ack
        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                targetUsers: [bobId, charlieId],
                projectId,
                notificationType: "Message",
                notificationMessage: "Alice sent a new message",
            }, resolve);
        });

        // wait for broadcast
        const received = await receivedPromise;

        // expect from socket
        expect(received.notification.targetUsers).toContain(bobId);
        expect(received.notification.projectId).toBe(projectId);
        expect(received.notification.notificationType).toBe("Message");
        expect(received.notification.notificationMessage).toBe("Alice sent a new message");
        expect(ack.success).toBe(true);
        expect(ack.message).toBe("Message sent successfully");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE project_id = $1
                AND notification_type = $2
                AND notification_message = $3
            ORDER BY notification_id ASC
        `, [
            projectId,
            "Message",
            "Alice sent a new message"
        ]);

        // expect from database
        expect(dbResult.rows.length).toBe(2);

        const targetUsers = dbResult.rows.map(
            row => row.user_id
        );

        expect(targetUsers).toContain(bobId);
        expect(targetUsers).toContain(charlieId);

        clientA.disconnect();
        clientB.disconnect();
    });

    test("notifications fail when targetUsers is missing", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        // send invalid notification (NO targetUsers)
        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                projectId,
                notificationType: "Message",
                notificationMessage: "Hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing required notification fields");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE notification_message = $1
        `, ["Hello world"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("notifications fail when targetUsers is not an array", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                targetUsers: "not-an-array",
                projectId,
                notificationType: "Message",
                notificationMessage: "Hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing required notification fields");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE notification_message = $1
        `, ["Hello world"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("notifications fail when targetUsers array is empty", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                targetUsers: [],
                projectId,
                notificationType: "Message",
                notificationMessage: "Hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing required notification fields");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE notification_message = $1
        `, ["Hello world"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("notifications fail when notificationType is missing", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                targetUsers: [bobId, charlieId],
                projectId,
                notificationMessage: "Hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing required notification fields");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE notification_message = $1
        `, ["Hello world"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("notifications fail when notificationMessage is missing", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                targetUsers: [bobId, charlieId],
                projectId,
                notificationType: "Message"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing required notification fields");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE notification_type = $1
        `, ["Message"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("notifications fail when notificationType is invalid", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                targetUsers: [bobId, charlieId],
                projectId,
                notificationType: "Banana",
                notificationMessage: "Hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Invalid notification type");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE notification_message = $1
        `, ["Hello world"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("notifications fail with database error (invalid user id)", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("notification", {
                targetUsers: [crypto.randomUUID()],
                projectId,
                notificationType: "Message",
                notificationMessage: "Hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Database error");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM notifications
            WHERE notification_message = $1
        `, ["Hello world"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });
})