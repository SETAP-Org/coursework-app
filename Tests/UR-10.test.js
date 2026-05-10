// UR-10: Authenticated users should be able to view & open files

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates uploading a file
function simulateFileUpload(projectId, fileName, fileSizeInMB, existingFiles) {
  if (!projectId) {
    return { success: false, message: "Project ID is required" };
  }
  if (!fileName) {
    return { success: false, message: "File name is required" };
  }
  // File size cap at 10MB
  if (fileSizeInMB > 10) {
    return { success: false, message: "File size exceeds the 10MB limit" };
  }
  // Check for duplicate file name
  const duplicate = existingFiles.find(file => file.fileName === fileName);
  if (duplicate) {
    return { success: false, message: "A file with this name already exists" };
  }
  const newFile = {
    id: existingFiles.length + 1,
    projectId,
    fileName,
    fileSizeInMB,
    uploadedAt: new Date().toISOString()
  };
  return {
    success: true,
    message: "File uploaded successfully",
    file: newFile
  };
}

// Simulates viewing or downloading a file
function simulateViewFile(fileId, existingFiles, hasProjectAccess) {
  if (!hasProjectAccess) {
    return { success: false, message: "You do not have access to this project" };
  }
  const file = existingFiles.find(f => f.id === fileId);
  if (!file) {
    return { success: false, message: "File does not exist" };
  }
  return {
    success: true,
    message: "File opened successfully",
    file
  };
}

// ============================================================
// UR-10 TEST 1: Valid MS account, existing project, upload a file
// Expected: File uploaded and stored for the project
// ============================================================
test("UR-10 Valid: Valid MS account, existing project, upload a file", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingFiles = [];
  const uploadResult = simulateFileUpload(
    "project_123", 
    "report.pdf",
    2,
    existingFiles
  );

  expect(uploadResult.success).toBe(true);
  expect(uploadResult.message).toBe("File uploaded successfully");
  expect(uploadResult.file.fileName).toBe("report.pdf");
  expect(uploadResult.file.projectId).toBe("project_123");
  expect(uploadResult.file.fileSizeInMB).toBe(2);
});

// ============================================================
// UR-10 TEST 2: Valid MS account, existing project, view a file
// Expected: File opened and available to download
// ============================================================
test("UR-10 Valid: Valid MS account, existing project, view a file", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingFiles = [
    { id: 1, projectId: "project_123", fileName: "report.pdf", fileSizeInMB: 2 },
    { id: 2, projectId: "project_123", fileName: "notes.docx", fileSizeInMB: 1 },
  ];

  const viewResult = simulateViewFile(
    1,
    existingFiles,
    true
  );

  expect(viewResult.success).toBe(true);
  expect(viewResult.message).toBe("File opened successfully");
  expect(viewResult.file.fileName).toBe("report.pdf");
});

// ============================================================
// UR-10 TEST 3: Valid MS account, upload a 100GB file
// Expected: Fails, file size exceeds the limit
// ============================================================
test("UR-10 Invalid: Valid MS account, upload a 100GB file", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingFiles = [];
  const uploadResult = simulateFileUpload(
    "project_123",
    "bigfile.zip",
    123456,
    existingFiles
  );

  expect(uploadResult.success).toBe(false);
  expect(uploadResult.message).toBe("File size exceeds the 10MB limit");
});

// ============================================================
// UR-10 TEST 4: Valid MS account, upload duplicate file name
// Expected: Fails, file with the same name already exists
// ============================================================
test("UR-10 Invalid: Valid MS account, upload duplicate file name", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // report.pdf already exists in the project
  const existingFiles = [
    { id: 1, projectId: "project_123", fileName: "report.pdf", fileSizeInMB: 2 },
  ];

  const uploadResult = simulateFileUpload(
    "project_123",
    "report.pdf",
    3,
    existingFiles
  );

  expect(uploadResult.success).toBe(false);
  expect(uploadResult.message).toBe("A file with this name already exists");
});

// ============================================================
// UR-10 TEST 5: Valid MS account, view file without project access
// Expected: Fails, user does not have access to this project
// ============================================================
test("UR-10 Invalid: Valid MS account, view file without project access", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingFiles = [
    { id: 1, projectId: "project_123", fileName: "report.pdf", fileSizeInMB: 2 },
  ];

  const viewResult = simulateViewFile(
    1,
    existingFiles,
    false
  );

  expect(viewResult.success).toBe(false);
  expect(viewResult.message).toBe("You do not have access to this project");
});

// ============================================================
// UR-10 TEST 6: Valid MS account, view a file that does not exist
// Expected: Fails, file does not exist
// ============================================================
test("UR-10 Invalid: Valid MS account, view a file that does not exist", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingFiles = [
    { id: 1, projectId: "project_123", fileName: "report.pdf", fileSizeInMB: 2 },
  ];

  const viewResult = simulateViewFile(
    999,
    existingFiles,
    true
  );

  expect(viewResult.success).toBe(false);
  expect(viewResult.message).toBe("File does not exist");
});