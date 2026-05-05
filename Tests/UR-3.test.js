// UR-3: Authenticated users assigned as a team leader should be able to assign a team leader for a project 

// Simulates what happens when a user logs in
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

function simulateProjectCreation(projectName, projectDeadline, existingProject) {
  if (!projectName && !projectDeadline) {
    return { success: false, message: "Project name and deadline are required" };
  }
  else if (!projectName || !projectDeadline) {
    return { success: false, message: "Project name is missing" };
  }
  else if (new Date(projectDeadline) < new Date()) {
    return { success: false, message: "Project deadline has passed" };
  }
  else if (existingProject == projectName) {
    return { success: false, message: "Project already exists" };
  }
  return { success: true, projectId: 123 };
}

function simulateLeaderTransfer(memberID, groupLeadID, memberCount, newLeaderID) {
  // User is not the group leader so cannot transfer
  if (memberID !== groupLeadID) {
    return { success: false, message: "User is not the group leader" };
  }
  // Group is too small to transfer leadership
  else if (memberCount <= 1) {
    return { success: false, message: "Group is not large enough for this to occur" };
  }
  // New leader is not in the group
  else if (!newLeaderID) {
    return { success: false, message: "New leader ID is required" };
  }
  // New leader is the same as the current leader
  else if (newLeaderID === groupLeadID) {
    return { success: false, message: "New leader cannot be the same as the current leader" };
  }
  // All good
  return { success: true, message: "Leadership transferred successfully", newLeader: newLeaderID };
}

// ============================================================
// UR-3 TEST 1: Valid MS account, Existing project, > 2 members, transfer group leader
// Expected: Leadership transferred successfully
// ============================================================
test("UR-3 Valid: Valid MS account, Existing project, > 2 members, transfer group leader", () => {
  const hasValidToken = true;
  const cookiesAccepted = true;
  const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const projectCreationResult = simulateProjectCreation("New Project", "2099-05-05");
  expect(projectCreationResult.success).toBe(true);
  expect(projectCreationResult.projectId).toBeDefined();

  // memberID matches groupLeadID so the user IS the leader
  const transferResult = simulateLeaderTransfer(
    "user_1",   // memberID (the person clicking transfer)
    "user_1",   // groupLeadID (current leader)
    4,          // memberCount (4 members in the group)
    "user_2"    // newLeaderID (who they want to make leader)
  );

  expect(transferResult.success).toBe(true);
  expect(transferResult.message).toBe("Leadership transferred successfully");
  expect(transferResult.newLeader).toBe("user_2");
});

// ============================================================
// UR-3 TEST 2: Valid MS account, Existing project, user is NOT the group leader
// Expected: Transfer fails, user is not the group leader
// ============================================================
test("UR-3 Invalid: Valid MS account, user is not the group leader", () => {
  const hasValidToken = true;
  const cookiesAccepted = true;
  const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // memberID does NOT match groupLeadID so transfer should fail
  const transferResult = simulateLeaderTransfer(
    "user_2",   // memberID (not the leader)
    "user_1",   // groupLeadID (the actual leader)
    4,          // memberCount
    "user_3"    // newLeaderID
  );

  expect(transferResult.success).toBe(false);
  expect(transferResult.message).toBe("User is not the group leader");
});

// ============================================================
// UR-3 TEST 3: Valid MS account, Existing project, group only has 1 member
// Expected: Transfer fails, group is too small
// ============================================================
test("UR-3 Invalid: Valid MS account, group only has 1 member", () => {
  const hasValidToken = true;
  const cookiesAccepted = true;
  const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Only 1 member in the group so transfer should fail
  const transferResult = simulateLeaderTransfer(
    "user_1",   // memberID (the leader)
    "user_1",   // groupLeadID
    1,          // memberCount (only 1 member)
    "user_2"    // newLeaderID
  );

  expect(transferResult.success).toBe(false);
  expect(transferResult.message).toBe("Group is not large enough for this to occur");
});

// ============================================================
// UR-3 TEST 4: Valid MS account, Existing project, new leader is same as current leader
// Expected: Transfer fails, cannot transfer to yourself
// ============================================================
test("UR-3 Invalid: Valid MS account, new leader is the same as current leader", () => {
  const hasValidToken = true;
  const cookiesAccepted = true;
  const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // New leader is the same as the current leader so transfer should fail
  const transferResult = simulateLeaderTransfer(
    "user_1",   // memberID (the leader)
    "user_1",   // groupLeadID
    4,          // memberCount
    "user_1"    // newLeaderID (same as current leader)
  );

  expect(transferResult.success).toBe(false);
  expect(transferResult.message).toBe("New leader cannot be the same as the current leader");
});