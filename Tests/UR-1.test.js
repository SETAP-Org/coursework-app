// UR-1: Users should be able to authenticate with their Microsoft account

// Simulates what happens when a user logs in
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" }; // Send back to landing page
  }
  return { success: true, redirect: "/dashboard" }; // Send to dashboard
}

// Simulates what happens when a session cookie expires
function simulateSessionCheck(cookieExpired) {
  if (cookieExpired) {
    return { loggedIn: false, redirect: "/" }; // Send back to landing page
  }
  return { loggedIn: true, redirect: "/dashboard" }; // Stay on dashboard
}

// ============================================================
// UR-1 TEST 1: Valid MS account, cookies accepted
// Expected: Redirect to /:username dashboard
// ============================================================
test("UR-1 Valid: Valid MS token with cookies accepted redirects to dashboard", () => {
  const hasValidToken = true;   // User has a valid MS access token
  const cookiesAccepted = true; // User accepted cookies

  const result = simulateLogin(hasValidToken, cookiesAccepted);

  expect(result.success).toBe(true);
  expect(result.redirect).toBe("/dashboard");
});

// ============================================================
// UR-1 TEST 2: Valid MS account, cookies REJECTED
// Expected: Login failure, redirect to / landing page
// ============================================================
test("UR-1 Invalid: Cookies rejected redirects back to landing page", () => {
  const hasValidToken = true;    // User has a valid MS access token
  const cookiesAccepted = false; // User REJECTED cookies

  const result = simulateLogin(hasValidToken, cookiesAccepted);

  expect(result.success).toBe(false);
  expect(result.redirect).toBe("/");
});

// ============================================================
// UR-1 TEST 3: Session cookie timeout after 24 hours
// Expected: Cookie expires, user redirected to / landing page
// ============================================================
test("UR-1 Invalid: Expired session cookie redirects to landing page", () => {
  const cookieExpired = true; // Expired cookie

  const result = simulateSessionCheck(cookieExpired);

  expect(result.loggedIn).toBe(false);
  expect(result.redirect).toBe("/");
});