// UR-13: Authenticated users should be able to view notifications from anywhere inside the app

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates checking session validity
function simulateSessionCheck(sessionToken, sessionAgeInHours) {
  if (!sessionToken) {
    return { success: false, message: "No session token found", redirect: "/" };
  }
  // Session expires after 24 hours
  if (sessionAgeInHours >= 24) {
    return { success: false, message: "Session cookie has expired", redirect: "/" };
  }
  return { success: true, message: "Session is valid" };
}

// Simulates checking if the notification component is accessible on a given route
function simulateNotificationAccess(isAuthenticated, currentRoute, notifications) {
  // User must be authenticated to see notifications
  if (!isAuthenticated) {
    return {
      success: false,
      notificationVisible: false,
      message: "User is not authenticated, notification component not available"
    };
  }
  // Notification component should be visible on all internal routes
  const internalRoutes = [
    "/dashboard",
    "/project/123",
    "/project/123/tasks",
    "/project/123/calendar",
    "/project/123/files",
    "/profile"
  ];

  if (!internalRoutes.includes(currentRoute)) {
    return {
      success: false,
      notificationVisible: false,
      message: "Route not recognised as an internal app route"
    };
  }

  return {
    success: true,
    notificationVisible: true,
    message: "Notification component is visible",
    currentRoute,
    notifications: notifications || [],
    notificationCount: notifications ? notifications.length : 0
  };
}

// ============================================================
// UR-13 TEST 1: Valid MS account, navigates to dashboard
// Expected: Notification bell visible with current notifications
// ============================================================
test("UR-13 Valid: Valid MS account, notification bell visible on dashboard", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const mockNotifications = [
    { id: 1, message: "New task assigned to you",    read: false },
    { id: 2, message: "user_2 sent a message",       read: false },
    { id: 3, message: "Project deadline is tomorrow", read: true  },
  ];

  const notificationResult = simulateNotificationAccess(
    true,
    "/dashboard",
    mockNotifications 
  );

  expect(notificationResult.success).toBe(true);
  expect(notificationResult.notificationVisible).toBe(true);
  expect(notificationResult.message).toBe("Notification component is visible");
  expect(notificationResult.currentRoute).toBe("/dashboard");
  expect(notificationResult.notificationCount).toBe(3);
});

// ============================================================
// UR-13 TEST 2: Valid MS account, navigates to a project-specific page
// Expected: Notification bell still visible on project page
// ============================================================
test("UR-13 Valid: Valid MS account, notification bell visible on project page", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const mockNotifications = [
    { id: 1, message: "New task assigned to you", read: false },
  ];

  // Test notification visibility across multiple internal routes
  const internalRoutes = [
    "/project/123",
    "/project/123/tasks",
    "/project/123/calendar",
    "/project/123/files",
    "/profile"
  ];

  internalRoutes.forEach(route => {
    const notificationResult = simulateNotificationAccess(
      true,
      route,
      mockNotifications
    );

    expect(notificationResult.success).toBe(true);
    expect(notificationResult.notificationVisible).toBe(true);
    expect(notificationResult.currentRoute).toBe(route);
  });
});

// ============================================================
// UR-13 TEST 3: Invalid MS account, cookies rejected
// Expected: Redirect to landing page, no notifications visible
// ============================================================
test("UR-13 Invalid: Invalid MS account, cookies rejected, no notifications visible", () => {
  const loginResult = simulateLogin(
    false,
    false
  );

  expect(loginResult.success).toBe(false);
  expect(loginResult.redirect).toBe("/");

  // Since login failed, notification component should not be accessible
  const notificationResult = simulateNotificationAccess(
    false, 
    "/dashboard", 
    [] 
  );

  expect(notificationResult.success).toBe(false);
  expect(notificationResult.notificationVisible).toBe(false);
  expect(notificationResult.message).toBe("User is not authenticated, notification component not available");
});

// ============================================================
// UR-13 TEST 4: Authenticated user with expired session cookie
// Expected: Session expires, redirect to landing page, notifications no longer accessible
// ============================================================
test("UR-13 Invalid: Expired session cookie, notifications no longer accessible", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Simulate session that has been active for 25 hours (expired after 24)
  const sessionResult = simulateSessionCheck(
    "valid-session-token",
    25
  );

  expect(sessionResult.success).toBe(false);
  expect(sessionResult.message).toBe("Session cookie has expired");
  expect(sessionResult.redirect).toBe("/");

  // Since session expired, notification component should not be accessible
  const notificationResult = simulateNotificationAccess(
    false,
    "/dashboard",
    []
  );

  expect(notificationResult.success).toBe(false);
  expect(notificationResult.notificationVisible).toBe(false);
  expect(notificationResult.message).toBe("User is not authenticated, notification component not available");
});

// ============================================================
// UR-13 TEST 5: Valid MS account, session still active (under 24 hours)
// Expected: Session valid, notifications still accessible
// ============================================================
test("UR-13 Valid: Valid MS account, session still active, notifications accessible", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Simulate session that has been active for 12 hours (still valid)
  const sessionResult = simulateSessionCheck(
    "valid-session-token", 
    12 
  );

  expect(sessionResult.success).toBe(true);
  expect(sessionResult.message).toBe("Session is valid");

  // Notifications should still be accessible
  const mockNotifications = [
    { id: 1, message: "New task assigned", read: false },
  ];

  const notificationResult = simulateNotificationAccess(
    true, 
    "/dashboard",
    mockNotifications
  );

  expect(notificationResult.success).toBe(true);
  expect(notificationResult.notificationVisible).toBe(true);
  expect(notificationResult.notificationCount).toBe(1);
});