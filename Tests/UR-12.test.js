// UR-12: Authenticated users should be able to receive email notifications

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates sending an email notification
function simulateSendEmailNotification(
  transporterConnected,
  targetEmailPreference,
  triggerUserId,
  targetUserId,
  notificationType,
  projectMembers
) {
  // Transporter must be connected
  if (!transporterConnected) {
    return { success: false, message: "Email transporter is not connected" };
  }
  // Target must have email notifications enabled
  if (!targetEmailPreference) {
    return { success: false, message: "User has email notifications disabled" };
  }
  // Cannot send notification to yourself
  if (triggerUserId === targetUserId) {
    return { success: false, message: "Cannot send notification to yourself" };
  }
  // Target must be in the project
  if (!projectMembers.includes(targetUserId)) {
    return { success: false, message: "Target user is not a project member" };
  }
  // Notification type must be provided
  if (!notificationType) {
    return { success: false, message: "Notification type is required" };
  }
  return {
    success: true,
    message: "Email notification sent",
    sentTo: targetUserId,
    notificationType
  };
}

// Simulates formatting an email notification
function simulateFormatEmail(notificationType, projectName, senderName) {
  if (!notificationType) {
    return { success: false, message: "Notification type is required" };
  }
  if (!projectName) {
    return { success: false, message: "Project name is required" };
  }
  if (!senderName) {
    return { success: false, message: "Sender name is required" };
  }

  // Build the email content based on notification type
  const emailTemplates = {
    "new_task": {
      subject: `GCMS - New Task Assigned in ${projectName}`,
      body: `${senderName} has assigned you a new task in ${projectName}`,
      hasLogo: true,
      hasBranding: true
    },
    "chat_message": {
      subject: `GCMS - New Message in ${projectName}`,
      body: `${senderName} sent a message in ${projectName}`,
      hasLogo: true,
      hasBranding: true
    },
    "new_member": {
      subject: `GCMS - New Member Added to ${projectName}`,
      body: `${senderName} added a new member to ${projectName}`,
      hasLogo: true,
      hasBranding: true
    }
  };

  const template = emailTemplates[notificationType];
  if (!template) {
    return { success: false, message: "Unknown notification type" };
  }

  return {
    success: true,
    message: "Email formatted successfully",
    email: template
  };
}

// Simulates toggling email notification preference
function simulateToggleEmailPreference(currentPreference) {
  return {
    success: true,
    message: "Email preference updated",
    newPreference: !currentPreference // Toggles true to false and vice versa
  };
}

// Simulates a spam filter
function simulateSpamFilter(emailLog, newEmail, timeWindowSeconds, maxEmailsAllowed) {
  // Get emails sent to the same user in the time window
  const now = Date.now();
  const recentEmails = emailLog.filter(email =>
    email.targetUserId === newEmail.targetUserId &&
    (now - email.sentAt) <= timeWindowSeconds * 1000
  );

  if (recentEmails.length >= maxEmailsAllowed) {
    return {
      success: false,
      message: "Spam filter triggered, too many emails sent in a short time"
    };
  }

  return {
    success: true,
    message: "Email passed spam filter",
    emailsSentInWindow: recentEmails.length + 1
  };
}

// ============================================================
// UR-12 TEST 1: Valid MS account, transporter connected, send notification to group member
// Expected: Email notification sent to all members except the trigger user
// ============================================================
test("UR-12 Valid: Valid MS account, email notification sent to group member", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectMembers = ["user_1", "user_2", "user_3", "user_4"];

  // Send notification to all members except the trigger user (user_1)
  const recipients = projectMembers.filter(member => member !== "user_1");

  recipients.forEach(targetUserId => {
    const notificationResult = simulateSendEmailNotification(
      true,// Transporter is connected
      true,// Target has email notifications enabled
      "user_1",// Trigger user (the one who performed the action)
      targetUserId, // Target user
      "new_task",// Notification type
      projectMembers// Project members
    );

    expect(notificationResult.success).toBe(true);
    expect(notificationResult.message).toBe("Email notification sent");
    expect(notificationResult.sentTo).toBe(targetUserId);
    expect(notificationResult.notificationType).toBe("new_task");
  });
});

// ============================================================
// UR-12 TEST 2: Email formatted with GCMS branding and relevant information
// Expected: Email contains logo, branding and correct notification details
// ============================================================
test("UR-12 Valid: Email formatted with GCMS branding and notification details", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Test formatting for a new task notification
  const taskEmailResult = simulateFormatEmail(
    "new_task",// Notification type
    "SETAP Project",// Project name
    "user_1" // Sender name
  );

  expect(taskEmailResult.success).toBe(true);
  expect(taskEmailResult.email.hasLogo).toBe(true); // Has GCMS logo
  expect(taskEmailResult.email.hasBranding).toBe(true); // Has GCMS branding
  expect(taskEmailResult.email.subject).toContain("GCMS");
  expect(taskEmailResult.email.subject).toContain("SETAP Project");
  expect(taskEmailResult.email.body).toContain("user_1");

  // Test formatting for a chat message notification
  const chatEmailResult = simulateFormatEmail(
    "chat_message",// Notification type
    "SETAP Project",// Project name
    "user_2" // Sender name
  );

  expect(chatEmailResult.success).toBe(true);
  expect(chatEmailResult.email.hasLogo).toBe(true);
  expect(chatEmailResult.email.hasBranding).toBe(true);
  expect(chatEmailResult.email.subject).toContain("GCMS");
  expect(chatEmailResult.email.body).toContain("user_2");
});

// ============================================================
// UR-12 TEST 3: Valid MS account, toggle email notification preference
// Expected: Preference toggled from TRUE to FALSE and vice versa
// ============================================================
test("UR-12 Valid: Valid MS account, toggle email notification preference", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Toggle from TRUE to FALSE
  const toggleOffResult = simulateToggleEmailPreference(true);
  expect(toggleOffResult.success).toBe(true);
  expect(toggleOffResult.message).toBe("Email preference updated");
  expect(toggleOffResult.newPreference).toBe(false); // Was true, now false

  // Toggle from FALSE to TRUE
  const toggleOnResult = simulateToggleEmailPreference(false);
  expect(toggleOnResult.success).toBe(true);
  expect(toggleOnResult.message).toBe("Email preference updated");
  expect(toggleOnResult.newPreference).toBe(true); // Was false, now true
});

// ============================================================
// UR-12 TEST 4: Valid MS account, emails sent at high volume (spam filter)
// Expected: Spam filter triggered after too many emails in a short time
// ============================================================
test("UR-12 Invalid: Spam filter triggered on high volume of emails", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const now = Date.now();

  // Simulate 5 emails already sent to user_2 in the last 10 seconds
  const emailLog = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    targetUserId: "user_2",
    sentAt: now - (i * 1000) // Each one second apart
  }));

  // Try to send a 6th email within the same time window
  const newEmail = { targetUserId: "user_2" };

  const spamResult = simulateSpamFilter(
    emailLog,// Existing email log
    newEmail,// New email trying to be sent
    10, // Time window of 10 seconds
    5 // Max 5 emails allowed per window
  );

  expect(spamResult.success).toBe(false);
  expect(spamResult.message).toBe("Spam filter triggered, too many emails sent in a short time");
});

// ============================================================
// UR-12 TEST 5: Valid MS account, email notification preference disabled
// Expected: Email not sent, user has notifications disabled
// ============================================================
test("UR-12 Invalid: Valid MS account, email notification preference disabled", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectMembers = ["user_1", "user_2"];

  const notificationResult = simulateSendEmailNotification(
    true,// Transporter is connected
    false,// Target has email notifications DISABLED
    "user_1",// Trigger user
    "user_2",// Target user
    "new_task",// Notification type
    projectMembers
  );

  expect(notificationResult.success).toBe(false);
  expect(notificationResult.message).toBe("User has email notifications disabled");
});

// ============================================================
// UR-12 TEST 6: Valid MS account, trigger user cannot receive their own notification
// Expected: Notification not sent to the user who triggered it
// ============================================================
test("UR-12 Invalid: Valid MS account, trigger user cannot receive own notification", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectMembers = ["user_1", "user_2"];

  const notificationResult = simulateSendEmailNotification(
    true,// Transporter is connected
    true,// Target has email notifications enabled
    "user_1",// Trigger user
    "user_1",// Target is the SAME as trigger user
    "new_task",
    projectMembers
  );

  expect(notificationResult.success).toBe(false);
  expect(notificationResult.message).toBe("Cannot send notification to yourself");
});