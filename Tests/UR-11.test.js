// UR-11: Authenticated users should be able to view team member contributions

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates calculating contributions for each member
function simulateCalculateContributions(projectId, completedTasks) {
  if (!projectId) {
    return { success: false, message: "Project ID is required" };
  }
  if (!completedTasks || completedTasks.length === 0) {
    return { success: true, message: "No completed tasks found", contributions: [] };
  }

  // Add up total weighting of all completed tasks
  const totalWeighting = completedTasks.reduce((sum, task) => sum + task.weighting, 0);

  if (totalWeighting === 0) {
    return { success: false, message: "Total weighting cannot be zero" };
  }

  // Group tasks by member and calculate their percentage
  const memberContributions = {};
  completedTasks.forEach(task => {
    if (!memberContributions[task.assignedTo]) {
      memberContributions[task.assignedTo] = { totalWeighting: 0, completedTasks: 0 };
    }
    memberContributions[task.assignedTo].totalWeighting += task.weighting;
    memberContributions[task.assignedTo].completedTasks += 1;
  });

  // Convert to array with percentage
  const contributions = Object.entries(memberContributions).map(([userId, data]) => ({
    userId,
    totalWeighting: data.totalWeighting,
    completedTasks: data.completedTasks,
    percentage: Math.round((data.totalWeighting / totalWeighting) * 100)
  }));

  // Verify percentages add up to 100
  const totalPercentage = contributions.reduce((sum, c) => sum + c.percentage, 0);

  return {
    success: true,
    message: "Contributions calculated",
    contributions,
    totalPercentage
  };
}

// ============================================================
// UR-11 TEST 1: Valid MS account, existing project, view contributions
// Expected: Proportional graph data returned with correct percentages
// ============================================================
test("UR-11 Valid: Valid MS account, view proportional contributions", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Simulated completed tasks with weightings
  const completedTasks = [
    { id: 1, assignedTo: "user_1", taskName: "Write intro",     weighting: 25, completed: true },
    { id: 2, assignedTo: "user_2", taskName: "Write section 2", weighting: 25, completed: true },
    { id: 3, assignedTo: "user_3", taskName: "Write section 3", weighting: 25, completed: true },
    { id: 4, assignedTo: "user_4", taskName: "Write conclusion", weighting: 25, completed: true },
  ];

  const contributionResult = simulateCalculateContributions("project_123", completedTasks);

  expect(contributionResult.success).toBe(true);
  expect(contributionResult.message).toBe("Contributions calculated");
  expect(contributionResult.contributions.length).toBe(4); // 4 members

  // Each member should have 25% contribution
  contributionResult.contributions.forEach(contribution => {
    expect(contribution.percentage).toBe(25);
  });
});

// ============================================================
// UR-11 TEST 2: Valid MS account, existing project, unequal contributions
// Expected: Percentages reflect the weighting of tasks completed
// ============================================================
test("UR-11 Valid: Valid MS account, unequal contributions reflected correctly", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // user_1 did more work than user_2
  const completedTasks = [
    { id: 1, assignedTo: "user_1", taskName: "Write intro",     weighting: 75, completed: true },
    { id: 2, assignedTo: "user_2", taskName: "Write conclusion", weighting: 25, completed: true },
  ];

  const contributionResult = simulateCalculateContributions("project_123", completedTasks);

  expect(contributionResult.success).toBe(true);

  const user1 = contributionResult.contributions.find(c => c.userId === "user_1");
  const user2 = contributionResult.contributions.find(c => c.userId === "user_2");

  expect(user1.percentage).toBe(75); 
  expect(user2.percentage).toBe(25); 
});

// ============================================================
// UR-11 TEST 3: Valid MS account, existing project, one member did all the work
// Expected: One member shows 100%, others show 0%
// ============================================================
test("UR-11 Valid: Valid MS account, one member completed all tasks", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const completedTasks = [
    { id: 1, assignedTo: "user_1", taskName: "Task 1", weighting: 50, completed: true },
    { id: 2, assignedTo: "user_1", taskName: "Task 2", weighting: 50, completed: true },
  ];

  const contributionResult = simulateCalculateContributions("project_123", completedTasks);

  expect(contributionResult.success).toBe(true);
  expect(contributionResult.contributions.length).toBe(1); 
  const user1 = contributionResult.contributions.find(c => c.userId === "user_1");
  expect(user1.percentage).toBe(100);   
  expect(user1.completedTasks).toBe(2); 
});

// ============================================================
// UR-11 TEST 4: Valid MS account, existing project, no completed tasks
// Expected: Empty contributions array returned
// ============================================================
test("UR-11 Valid: Valid MS account, no completed tasks returns empty contributions", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const contributionResult = simulateCalculateContributions("project_123", []);

  expect(contributionResult.success).toBe(true);
  expect(contributionResult.message).toBe("No completed tasks found");
  expect(contributionResult.contributions).toEqual([]);
});

// ============================================================
// UR-11 TEST 5: Invalid MS account, view contributions
// Expected: Redirect to landing page
// ============================================================
test("UR-11 Invalid: Invalid MS account, redirected to landing page", () => {
  const loginResult = simulateLogin(false, false);

  expect(loginResult.success).toBe(false);
  expect(loginResult.redirect).toBe("/");
});