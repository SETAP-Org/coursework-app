// UR-4: Authenticated users assigned as a team leader should be able to manage members for their projects

// Simulates what happens when a user logs in
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates deleting a project
function simulateDeleteProject(isProjectLead, projectExists) {
  if (!isProjectLead) {
    return { success: false, message: "User is not the project lead" };
  }
  if (!projectExists) {
    return { success: false, message: "Project does not exist" };
  }
  return { success: true, message: "Project deleted", redirect: "/dashboard" };
}

// Simulates adding a member to a project
function simulateAddMember(isProjectLead, username, existingUsers) {
  if (!isProjectLead) {
    return { success: false, message: "User is not the project lead" };
  }
  if (!username) {
    return { success: false, message: "Username is required" };
  }
  // Check if the user exists in the system
  if (!existingUsers.includes(username)) {
    return { success: false, message: "this user does not exist" };
  }
  return { success: true, message: "User added to project, notification sent" };
}

// Simulates leaving a project
function simulateLeaveProject(isProjectLead, memberCount) {
  // Project lead cannot leave without assigning a new lead
  if (isProjectLead && memberCount >= 2) {
    return { success: false, message: "You must assign a new leader before leaving" };
  }
  // Cannot leave if only member
  if (memberCount <= 1) {
    return { success: false, message: "You are the only member, delete the project instead" };
  }
  return { success: true, message: "User removed from project" };
}

// ============================================================
// UR-4 TEST 1: Valid MS account, existing project, project lead, Delete project
// Expected: Project deleted, redirect to dashboard
// ============================================================
test("UR-4 Valid: Valid MS account, project lead, delete project", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const deleteResult = simulateDeleteProject(
    true, // User IS the project lead
    true // Project EXISTS
  );

  expect(deleteResult.success).toBe(true);
  expect(deleteResult.message).toBe("Project deleted");
  expect(deleteResult.redirect).toBe("/dashboard");
});

// ============================================================
// UR-4 TEST 2: Valid MS account, existing project, project lead, Add member
// Expected: Member added, notification sent
// ============================================================
test("UR-4 Valid: Valid MS account, project lead, add existing member", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingUsers = ["user_1", "user_2", "user_3"]; // Simulated database of users
  const addResult = simulateAddMember(
    true, // User IS the project lead
    "user_2",// Username to add
    existingUsers // List of existing users
  );

  expect(addResult.success).toBe(true);
  expect(addResult.message).toBe("User added to project, notification sent");
});

// ============================================================
// UR-4 TEST 3: Valid MS account, existing project, >= 2 members, Leave project
// Expected: User leaves project, removed from database
// ============================================================
test("UR-4 Valid: Valid MS account, not project lead, >= 2 members, leave project", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const leaveResult = simulateLeaveProject(
    false, // User is NOT the project lead
    4  // 4 members in the group
  );

  expect(leaveResult.success).toBe(true);
  expect(leaveResult.message).toBe("User removed from project");
});

// ============================================================
// UR-4 TEST 4: Valid MS account, project lead, >= 2 members, Leave project
// Expected: Fails, project lead cannot leave without assigning a new lead first
// ============================================================
test("UR-4 Invalid: Valid MS account, project lead cannot leave without assigning new leader", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const leaveResult = simulateLeaveProject(
    true,  // User IS the project lead
    4// 4 members in the group
  );

  expect(leaveResult.success).toBe(false);
  expect(leaveResult.message).toBe("You must assign a new leader before leaving");
});

// ============================================================
// UR-4 TEST 5: Invalid MS account, project lead, Add/Remove/Leave
// Expected: Redirect to landing page, no access
// ============================================================
test("UR-4 Invalid: Invalid MS account, redirected to landing page", () => {
  const loginResult = simulateLogin(
    false, // No valid MS token
    false// Cookies not accepted
  );

  expect(loginResult.success).toBe(false);
  expect(loginResult.redirect).toBe("/");
});

// ============================================================
// UR-4 TEST 6: Valid MS account, project lead, add nonexistent user
// Expected: Fails, returns "this user does not exist"
// ============================================================
test("UR-4 Invalid: Valid MS account, project lead, add nonexistent user", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingUsers = ["user_1", "user_2", "user_3"]; // Simulated database of users
  const addResult = simulateAddMember(
    true,// User IS the project lead
    "user_999",// This user does NOT exist
    existingUsers// List of existing users
  );

  expect(addResult.success).toBe(false);
  expect(addResult.message).toBe("this user does not exist");
});