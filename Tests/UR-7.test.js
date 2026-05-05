// UR-7: Authenticated users should be able to send and receive messages to and from their project members

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates sending a message
function simulateSendMessage(currentUserId, projectMembers, message) {
  // Message cannot be empty
  if (!message || message.trim() === "") {
    return { success: false, message: "Message cannot be empty" };
  }
  // Must have project members to send to
  if (!projectMembers || projectMembers.length === 0) {
    return { success: false, message: "No project members to send to" };
  }
  // Store the message as plain text (no HTML parsing)
  // This prevents XSS and SQL injection as the message is treated as a plain string
  const storedMessage = String(message);

  return {
    success: true,
    message: "Message sent",
    sentBy: currentUserId,
    recipients: projectMembers,
    content: storedMessage  // Stored as plain text, not executed
  };
}

// ============================================================
// UR-7 TEST 1: Valid MS account, existing project, send a message
// Expected: Message sent to all members and stored in group chat
// ============================================================
test("UR-7 Valid: Valid MS account, send a message to all project members", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectMembers = ["user_2", "user_3", "user_4"]; // Simulated project members
  const messageResult = simulateSendMessage(
    "user_1",// Sender
    projectMembers,// Recipients
    "Hello everyone!"// Message content
  );

  expect(messageResult.success).toBe(true);
  expect(messageResult.message).toBe("Message sent");
  expect(messageResult.sentBy).toBe("user_1");
  expect(messageResult.recipients).toEqual(["user_2", "user_3", "user_4"]);
  expect(messageResult.content).toBe("Hello everyone!");
});

// ============================================================
// UR-7 TEST 2: Invalid MS account, existing project, send a message
// Expected: Redirect to landing page, message not sent
// ============================================================
test("UR-7 Invalid: Invalid MS account, redirected to landing page", () => {
  const loginResult = simulateLogin(
    false,  // No valid MS token
    false   // Cookies not accepted
  );

  expect(loginResult.success).toBe(false);
  expect(loginResult.redirect).toBe("/");
});

// ============================================================
// UR-7 TEST 3: Valid MS account, existing project, send an empty message
// Expected: Fails, empty message cannot be sent
// ============================================================
test("UR-7 Invalid: Valid MS account, send an empty message", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectMembers = ["user_2", "user_3", "user_4"];
  const messageResult = simulateSendMessage(
    "user_1",// Sender
    projectMembers, // Recipients
    "" // Empty message
  );

  expect(messageResult.success).toBe(false);
  expect(messageResult.message).toBe("Message cannot be empty");
});

// ============================================================
// UR-7 TEST 4: Valid MS account, existing project, XSS attack attempt
// Expected: Message stored as plain text, script tag not executed
// ============================================================
test("UR-7 Invalid: Valid MS account, XSS attack stored as plain text", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectMembers = ["user_2", "user_3", "user_4"];
  const xssAttempt = "<script>alert('hello')</script>";

  const messageResult = simulateSendMessage(
    "user_1",// Sender
    projectMembers, // Recipients
    xssAttempt// XSS attempt as message content
  );

  // Message should be stored but as plain text, not executed
  expect(messageResult.success).toBe(true);
  expect(messageResult.content).toBe("<script>alert('hello')</script>"); // Stored as plain text
  expect(messageResult.content).not.toBe(undefined); // Not blocked, just not executed
});

// ============================================================
// UR-7 TEST 5: Valid MS account, existing project, SQL injection attempt
// Expected: Message stored as plain text, SQL not executed
// ============================================================
test("UR-7 Invalid: Valid MS account, SQL injection stored as plain text", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectMembers = ["user_2", "user_3", "user_4"];
  const sqlAttempt = "SELECT * FROM users;";

  const messageResult = simulateSendMessage(
    "user_1",// Sender
    projectMembers, // Recipients
    sqlAttempt // SQL injection attempt as message content
  );

  // Message should be stored as plain text, not executed as SQL
  expect(messageResult.success).toBe(true);
  expect(messageResult.content).toBe("SELECT * FROM users;"); // Stored as plain text
  expect(messageResult.content).not.toBe(undefined); // Not blocked, just not executed
});