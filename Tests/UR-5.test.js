// UR-5: Authenticated users assigned as a team leader should be able to manage and assign tasks within a project

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates creating and assigning a task
function simulateCreateTask(isProjectLead, taskName, assignedTo, weighting) {
  if (!isProjectLead) {
    return { success: false, message: "Only the project leader can assign tasks" };
  }
  if (!taskName) {
    return { success: false, message: "Task name is required" };
  }
  if (!assignedTo) {
    return { success: false, message: "Task must be assigned to a member" };
  }
  if (!weighting || weighting < 1 || weighting > 100) {
    return { success: false, message: "Task weighting must be between 1 and 100" };
  }
  return {
    success: true,
    message: "Task created and assigned",
    task: { taskName, assignedTo, weighting, completed: false }
  };
}

// Simulates ticking off a task
function simulateTickOffTask(isProjectLead, isMemberAssigned, taskExists) {
  if (!taskExists) {
    return { success: false, message: "Task does not exist" };
  }
  if (!isProjectLead && !isMemberAssigned) {
    return { success: false, message: "Only the project lead or assigned member can complete this task" };
  }
  return { success: true, message: "Task marked as complete" };
}

// ============================================================
// UR-5 TEST 1: Valid MS account, existing project, team leader, assign task with weighting
// Expected: Task created and assigned successfully
// ============================================================
test("UR-5 Valid: Valid MS account, team leader, assign task with weighting", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const taskResult = simulateCreateTask(
    true,
    "Write report section 1", 
    "user_2",
    25
  );

  expect(taskResult.success).toBe(true);
  expect(taskResult.message).toBe("Task created and assigned");
  expect(taskResult.task.taskName).toBe("Write report section 1");
  expect(taskResult.task.assignedTo).toBe("user_2");
  expect(taskResult.task.weighting).toBe(25);
  expect(taskResult.task.completed).toBe(false);
});

// ============================================================
// UR-5 TEST 2: Valid MS account, existing project, NOT team leader, create task
// Expected: Fails, only the project leader can assign tasks
// ============================================================
test("UR-5 Invalid: Valid MS account, not team leader, cannot create task", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const taskResult = simulateCreateTask(
    false,                   
    "Write report section 2",
    "user_3",
    25
  );

  expect(taskResult.success).toBe(false);
  expect(taskResult.message).toBe("Only the project leader can assign tasks");
});

// ============================================================
// UR-5 TEST 3: Valid MS account, team leader, tick off task on behalf of member
// Expected: Task marked as complete by the project lead
// ============================================================
test("UR-5 Valid: Valid MS account, team leader, tick off task on behalf of member", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const tickOffResult = simulateTickOffTask(
    true,  
    false,  
    true 
  );

  expect(tickOffResult.success).toBe(true);
  expect(tickOffResult.message).toBe("Task marked as complete");
});