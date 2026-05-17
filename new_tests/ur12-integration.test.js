import { jest } from "@jest/globals";
import { query } from "../db/connection.js";
import { postNotificationModel } from "../models/notificationModels.js";

// mock email sending
jest.mock("../utils/emailSender.js", () => ({
  sendNotificationEmail: jest.fn().mockResolvedValue(true),
}));

describe("INTEGRATION TESTS - postNotificationModel", () => {
  let aliceId, bobId, charlieId;
  let projectId;
  let allowedTypes = [];

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

  function safeType(index = 0) {
    return allowedTypes[index % allowedTypes.length];
  }

  test("Notification created successfully", async () => {
    const result = await postNotificationModel(
      aliceId,
      projectId,
      safeType(0),
      "Test message 1",
      "alice",
      "Test Project"
    );

    expect(result.rows[0]).toBeDefined();
    expect(result.rows[0].notification_message).toBe("Test message 1");
  });

  test("Email flag true", async () => {
    const result = await postNotificationModel(
      bobId,
      projectId,
      safeType(1),
      "Email test on",
      "bob",
      "Test Project"
    );

    expect(result.rows[0]).toBeDefined();
  });

  test("Email flag false", async () => {
    const result = await postNotificationModel(
      bobId,
      projectId,
      safeType(2),
      "Email test off",
      "bob",
      "Test Project"
    );

    expect(result.rows[0]).toBeDefined();
  });

  test("User fetch success", async () => {
    const result = await postNotificationModel(
      charlieId,
      projectId,
      safeType(0),
      "User fetch test",
      "charlie",
      "Test Project"
    );

    expect(result.rows[0].user_id).toBe(charlieId);
  });

  test("DB query success", async () => {
    const result = await postNotificationModel(
      aliceId,
      projectId,
      safeType(1),
      "DB query test",
      "alice",
      "Test Project"
    );

    expect(result.rows.length).toBeGreaterThan(0);
  });

  test("Full notification flow executes", async () => {
    const result = await postNotificationModel(
      aliceId,
      projectId,
      safeType(0),
      "Full flow test",
      "alice",
      "Test Project"
    );

    expect(result.rows[0].notification_message).toBe("Full flow test");
  });

  test("Multiple notifications stored", async () => {
    const n1 = await postNotificationModel(
      aliceId,
      projectId,
      safeType(0),
      "Multi 1",
      "alice",
      "Test Project"
    );

    const n2 = await postNotificationModel(
      bobId,
      projectId,
      safeType(1),
      "Multi 2",
      "bob",
      "Test Project"
    );

    expect(n1.rows[0].notification_id).not.toBe(
      n2.rows[0].notification_id
    );
  });
});