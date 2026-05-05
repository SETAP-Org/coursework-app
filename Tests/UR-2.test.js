// UR-2: Authenticated users should be able to create a project

// Login simulation
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

function simulateProjectCreation(projectName, projectDeadline, existingProject) {
  // Both missing
  if (!projectName && !projectDeadline) {
    return { success: false, message: "Project name and deadline are required" };
  }
  // One missing
  else if (!projectName || !projectDeadline) {
    return { success: false, message: "Project name is missing" };
  }
  // Check if deadline is in the past
  else if (new Date(projectDeadline) < new Date()) {
    return { success: false, message: "Project deadine has passed" };
  }
  //project already exists
  else if (existingProject == projectName)
    return { success: false, message: "Project already exists"};
  // All good here
  return { success: true, projectId: 123 };
}

// ============================================================
// UR-2 TEST 1: Valid MS account, new project clicked, Project name & Deadline set
// Expected: Project created successfully, user redirected to project dashboard
// ============================================================
test("UR-2 Valid: Valid MS account, new project clicked, Project name & Deadline set", () => {
    const hasValidToken = true;
    const cookiesAccepted = true;
    const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

    expect(loginResult.success).toBe(true);
    expect(loginResult.redirect).toBe("/dashboard");

    const projectName = "New Project";
    const projectDeadline = "2099-05-05"; // Far future date so it never expires
    const projectCreationResult = simulateProjectCreation(projectName, projectDeadline);

    expect(projectCreationResult.success).toBe(true);
    expect(projectCreationResult.projectId).toBeDefined();
});

// ============================================================
// UR-2 TEST 2: Invalid MS account, Create new project
// Expected: Invalid login, user redirected to landing page, project creation fails
// ============================================================
test("UR-2 Invalid: Invalid MS account, Create new project", () => {
    const hasValidToken = false;
    const cookiesAccepted = false;
    const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

    expect(loginResult.success).toBe(false);
    expect(loginResult.redirect).toBe("/");

    const projectName = "";
    const projectDeadline = "";
    const projectCreationResult = simulateProjectCreation(projectName, projectDeadline);

    expect(projectCreationResult.success).toBe(false);
    expect(projectCreationResult.message).toBe("Project name and deadline are required");
});

// ============================================================
// UR-2 TEST 3: Valid MS account, new project clicked, Expired deadline
// Expected: Project creation fails because deadline has already passed
// ============================================================
test("UR-2 Invalid: Valid MS account, Create new project, Expired deadline", () => {
    const hasValidToken = true;
    const cookiesAccepted = true;
    const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

    expect(loginResult.success).toBe(true);
    expect(loginResult.redirect).toBe("/dashboard");

    const projectName = "Project 3";
    const projectDeadline = "1800-01-01"; // Date in the past
    const projectCreationResult = simulateProjectCreation(projectName, projectDeadline);

    expect(projectCreationResult.success).toBe(false); // Should fail
    expect(projectCreationResult.message).toBe("Project deadine has passed"); // Note: kept your spelling
});

//================================================================
// UR-2 TEST 4: Valid MS account, create project, duplicate name
// Expected: Fails as one user cannot have duplicate owned projects
//================================================================
test("UR-2 Invalid: Valid MS account, Create new project, Duplicate project name", () => {
    const hasValidToken = true;
    const cookiesAccepted = true;
    const loginResult = simulateLogin(hasValidToken, cookiesAccepted);

    expect(loginResult.success).toBe(true);
    expect(loginResult.redirect).toBe("/dashboard");

    const existingProject = "Project 4"; // Already exists in the system
    const projectName = "Project 4";     // User tries to create one with the same name
    const projectDeadline = "2099-09-23";

    // Call the function with the duplicate name
    const projectCreationResult = simulateProjectCreation(projectName, projectDeadline, existingProject);

    expect(projectCreationResult.success).toBe(false);
    expect(projectCreationResult.message).toBe("Project already exists"); // Must match exactly
});

