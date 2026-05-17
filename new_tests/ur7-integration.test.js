// User Requirement 7:  Authenticated users should be able to send and receive messages to and from their project members

import { server } from "../server.js";
import Client from "socket.io-client";
import { query } from "../db/connection.js";
import { describe, jest, test } from "@jest/globals";


let port;

let aliceId;
let bobId;
let projectId;

// before each test, start the server and get the user and project data from the database
beforeAll((done) => {
    server.listen(0, async () => {
        port = server.address().port;

        const users = await query(`
            SELECT user_id, username
            FROM users
            WHERE microsoft_id IN ('ms-ur7-alice', 'ms-ur7-bob')
            ORDER BY username;
        `);

        aliceId = users.rows[0].user_id;
        bobId = users.rows[1].user_id;

        const project = await query(`
            SELECT project_id
            FROM projects
            WHERE project_name = 'UR7 Chat Project'
            LIMIT 1;
        `);

        projectId = project.rows[0].project_id;

        done();
    });
});


  beforeEach(async () => {

    // reset database tables
    await query(`
      TRUNCATE TABLE notifications, user_projects, tasks, projects, users
      RESTART IDENTITY CASCADE;
    `);

    // reseed required test data
    await query(`
      WITH alice AS (
          INSERT INTO users (
              user_first_name,
              user_last_name,
              user_email,
              microsoft_id,
              date_created,
              last_login,
              username,
              email_notifications
          )
          VALUES (
              'Alice',
              'Leader',
              'alice@example.com',
              'ms-alice',
              NOW(),
              NOW(),
              'alice',
              FALSE
          )
          RETURNING user_id
      ),

      bob AS (
          INSERT INTO users (
              user_first_name,
              user_last_name,
              user_email,
              microsoft_id,
              date_created,
              last_login,
              username,
              email_notifications
          )
          VALUES (
              'Bob',
              'Member',
              'bob@example.com',
              'ms-bob',
              NOW(),
              NOW(),
              'bob',
              FALSE
          )
          RETURNING user_id
      ),

      charlie AS (
          INSERT INTO users (
              user_first_name,
              user_last_name,
              user_email,
              microsoft_id,
              date_created,
              last_login,
              username,
              email_notifications
          )
          VALUES (
              'Charlie',
              'Contrib',
              'charlie@example.com',
              'ms-charlie',
              NOW(),
              NOW(),
              'charlie',
              FALSE
          )
          RETURNING user_id
      ),

      project AS (
          INSERT INTO projects (
              created_by,
              team_leader_id,
              project_name,
              project_deadline,
              p_date_created,
              p_time_updated
          )
          SELECT
              alice.user_id,
              alice.user_id,
              'Test Project',
              '2099-12-31',
              NOW(),
              NOW()
          FROM alice
          RETURNING project_id
      )

      INSERT INTO user_projects (user_id, project_id)
      SELECT alice.user_id, project.project_id
      FROM alice, project

      UNION ALL

      SELECT bob.user_id, project.project_id
      FROM bob, project

      UNION ALL

      SELECT charlie.user_id, project.project_id
      FROM charlie, project;
    `);

    // fetch enum values
    const enumRes = await query(`
      SELECT unnest(enum_range(NULL::notification_type)) AS type;
    `);

    allowedTypes = enumRes.rows.map((r) => r.type);

    if (allowedTypes.length === 0) {
      throw new Error("No notification_type enum values found in DB");
    }

    // fetch seeded users
    const users = await query(`
      SELECT user_id, username
      FROM users
      ORDER BY username;
    `);

    aliceId = users.rows.find((u) => u.username === "alice").user_id;
    bobId = users.rows.find((u) => u.username === "bob").user_id;
    charlieId = users.rows.find((u) => u.username === "charlie").user_id;

    // fetch seeded project
    const project = await query(`
      SELECT project_id
      FROM projects
      WHERE project_name = 'Test Project'
      LIMIT 1;
    `);

    projectId = project.rows[0].project_id;
  });
// after each test, close the server
afterAll((done) => {
    server.close(() => done());
});

describe("Chat socket", () => {
    test("message is delivered between users and saved in DB", async () => {
        // connect clients
        const clientA = new Client(`http://localhost:${port}`);
        const clientB = new Client(`http://localhost:${port}`);
    
        await Promise.all([
            new Promise(res => clientA.on("connect", res)),
            new Promise(res => clientB.on("connect", res)),
        ]);
    
        // listen for broadcast
        const receivedPromise = new Promise((resolve) => {
            clientB.on("chat", resolve);
        });
    
        // send message and capture ack
        const ack = await new Promise((resolve) => {
            clientA.emit("chat", {
                senderId: aliceId,
                projectId,
                message: "hello world"
            }, resolve);
        });
    
        // wait for broadcast
        const received = await receivedPromise;
    
        // expects from socket
        expect(received.sender_id).toBe(aliceId);
        expect(received.project_id).toBe(projectId);
        expect(received.message_content).toBe("hello world");
        expect(ack.success).toBe(true);
        expect(ack.message).toBe("Message sent successfully");
    
        // database check
        const dbResult = await query(`
            SELECT *
            FROM messages
            WHERE sender_id = $1
                AND project_id = $2
                AND message_content = $3
            ORDER BY m_date_sent DESC
            LIMIT 1;
        `, [aliceId, projectId, "hello world"]);
    
        const dbMessage = dbResult.rows[0];
    
        // expects from database
        expect(dbResult.rows.length).toBe(1);
        expect(dbMessage.sender_id).toBe(aliceId);
        expect(dbMessage.project_id).toBe(projectId);
        expect(dbMessage.message_content).toBe("hello world");
        
        // disconnect clients from socket
        clientA.disconnect();
        clientB.disconnect();
    });

    test("chat fails when senderId is invalid", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("chat", {
                senderId: "invalid-user-id",
                projectId,
                message: "this should fail"
            }, resolve);
        });

        // ack assertions
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Database error");

        // db assertion (no insert)
        const dbResult = await query(`
            SELECT *
            FROM messages
            WHERE message_content = $1;
        `, ["this should fail"]);

        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("chat fails when projectId is invalid", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("chat", {
                senderId: aliceId,
                projectId: "Invalid project ID",
                message: "this should fail"
            }, resolve);
        });

        // ack assertions
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Database error");

        // db assertion (no insert)
        const dbResult = await query(`
            SELECT *
            FROM messages
            WHERE message_content = $1;
        `, ["this should fail"]);

        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("chat fails when message content is missing", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("chat", {
                senderId: aliceId,
                projectId,
            }, resolve);
        });

        // expectations from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing senderId, projectId or message");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM messages
            WHERE sender_id = $1
                AND project_id = $2
                AND message_content IS NULL
        `, [aliceId, projectId]);

        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("chat fails when senderId is missing", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("chat", {
                projectId,
                message: "hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing senderId, projectId or message");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM messages
            WHERE project_id = $1
                AND message_content = $2
        `, [projectId, "hello world"]);

            // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("chat fails when projectId is missing", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("chat", {
                senderId: aliceId,
                message: "hello world"
            }, resolve);
        });

        // expect from ack
        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Missing senderId, projectId or message");

        // database query
        const dbResult = await query(`
            SELECT *
            FROM messages
            WHERE sender_id = $1
                AND message_content = $2
        `, [aliceId, "hello world"]);

        // expect from database
        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });

    test("returns database error when DB insert fails", async () => {
        const clientA = new Client(`http://localhost:${port}`);

        await new Promise(res => clientA.on("connect", res));

        const ack = await new Promise((resolve) => {
            clientA.emit("chat", {
                senderId: aliceId,
                projectId: "invalid-project-id",
                message: "hello world"
            }, resolve);
        });

        expect(ack.success).toBe(false);
        expect(ack.message).toBe("Database error");

        const dbResult = await query(`
            SELECT *
            FROM messages
            WHERE sender_id = $1
                AND message_content = $2
        `, [aliceId, "hello world"]);

        expect(dbResult.rows.length).toBe(0);

        clientA.disconnect();
    });
});
