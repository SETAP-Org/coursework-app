// UR-6: Authenticated users assigned to tasks should be able to update the status of the task

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates ticking off a task
function simulateTaskCompletion(currentUserId, taskOwnerId, taskExists) {
  // Task must exist
  if (!taskExists) {
    return { success: false, message: "Task does not exist" };
  }
  // User must be the task owner to tick it off
  if (currentUserId !== taskOwnerId) {
    return { success: false, message: "You cannot complete a task that does not belong to you" };
  }
  return { success: true, message: "Task marked as complete", weighting: 25 };
}

// ============================================================
// UR-6 TEST 1: Valid MS account, existing project, tick off own task
// Expected: Task marked as complete, weighting applied
// ============================================================
test("UR-6 Valid: Valid MS account, tick off own task", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const taskResult = simulateTaskCompletion(
    "user_1",// Current logged in user
    "user_1",// Task owner (same person)
    true // Task exists
  );

  expect(taskResult.success).toBe(true);
  expect(taskResult.message).toBe("Task marked as complete");
  expect(taskResult.weighting).toBeDefined(); // Weighting should be returned
});

// ============================================================
// UR-6 TEST 2: Valid MS account, existing project, tick off task that does not belong to user
// Expected: Fails, user cannot complete someone else's task
// ============================================================
test("UR-6 Invalid: Valid MS account, tick off task that does not belong to user", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const taskResult = simulateTaskCompletion(
    "user_1",// Current logged in user
    "user_2",// Task owner (different person)
    true  // Task exists
  );

  expect(taskResult.success).toBe(false);
  expect(taskResult.message).toBe("You cannot complete a task that does not belong to you");
});