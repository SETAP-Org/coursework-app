import { server } from "../server.js";
import Client from "socket.io-client";
import { query } from "../db/connection.js";

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

// after each test, close the server
afterAll((done) => {
    server.close(() => done());
});

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