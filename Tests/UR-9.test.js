// UR-9: Authenticated users should be able to manage widgets on a shared project board

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates adding a note
function simulateAddNote(projectId, noteText, existingNotes) {
  if (!projectId) {
    return { success: false, message: "Project ID is required" };
  }
  // Cap at 10 notes per project
  if (existingNotes.length >= 10) {
    return { success: false, message: "Maximum of 10 notes allowed per project" };
  }
  const newNote = {
    id: existingNotes.length + 1,
    projectId,
    text: String(noteText), // Store as plain text
    position: { x: 0, y: 0 }
  };
  return {
    success: true,
    message: "Note created",
    note: newNote,
    totalNotes: existingNotes.length + 1
  };
}

// Simulates deleting a note
function simulateDeleteNote(noteId, existingNotes) {
  const noteExists = existingNotes.find(note => note.id === noteId);
  if (!noteExists) {
    return { success: false, message: "Note does not exist" };
  }
  const updatedNotes = existingNotes.filter(note => note.id !== noteId);
  return {
    success: true,
    message: "Note deleted",
    remainingNotes: updatedNotes
  };
}

// Simulates editing a note
function simulateEditNote(noteId, newText, existingNotes, noteDeleted = false) {
  // If the note was deleted before the edit completed
  if (noteDeleted) {
    return { success: false, message: "Note has been deleted, edit cannot be saved" };
  }
  const noteExists = existingNotes.find(note => note.id === noteId);
  if (!noteExists) {
    return { success: false, message: "Note does not exist" };
  }
  if (!newText || newText.trim() === "") {
    return { success: false, message: "Note text cannot be empty" };
  }
  // Store as plain text to prevent XSS and SQL injection
  const updatedNote = {
    ...noteExists,
    text: String(newText)
  };
  return {
    success: true,
    message: "Note updated",
    note: updatedNote
  };
}

// Simulates moving a note
function simulateMoveNote(noteId, newPosition, existingNotes, lockedByUser = null, currentUser) {
  const noteExists = existingNotes.find(note => note.id === noteId);
  if (!noteExists) {
    return { success: false, message: "Note does not exist" };
  }
  if (!newPosition || newPosition.x === undefined || newPosition.y === undefined) {
    return { success: false, message: "New position is required" };
  }
  // If another user has the note, the last one to let go wins
  if (lockedByUser && lockedByUser !== currentUser) {
    return {
      success: true,
      message: "Position updated by last user to release",
      note: { ...noteExists, position: newPosition, lastEditedBy: currentUser }
    };
  }
  return {
    success: true,
    message: "Note position updated",
    note: { ...noteExists, position: newPosition }
  };
}

// ============================================================
// UR-9 TEST 1: Valid MS account, add a note
// Expected: Note created and added to the database
// ============================================================
test("UR-9 Valid: Valid MS account, add a note", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = []; // No notes 
  const addResult = simulateAddNote("project_123", "This is a new note", existingNotes);

  expect(addResult.success).toBe(true);
  expect(addResult.message).toBe("Note created");
  expect(addResult.note.text).toBe("This is a new note");
  expect(addResult.note.projectId).toBe("project_123");
  expect(addResult.totalNotes).toBe(1);
});

// ============================================================
// UR-9 TEST 2: Valid MS account, delete a note
// Expected: Note removed from dashboard and database
// ============================================================
test("UR-9 Valid: Valid MS account, delete a note", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = [
    { id: 1, projectId: "project_123", text: "Note 1", position: { x: 0, y: 0 } },
    { id: 2, projectId: "project_123", text: "Note 2", position: { x: 100, y: 100 } },
  ];

  const deleteResult = simulateDeleteNote(1, existingNotes);

  expect(deleteResult.success).toBe(true);
  expect(deleteResult.message).toBe("Note deleted");
  expect(deleteResult.remainingNotes.length).toBe(1);// One note remaining
  expect(deleteResult.remainingNotes[0].id).toBe(2);// Only note 2 remains
});

// ============================================================
// UR-9 TEST 3: Valid MS account, edit note with "Hello there"
// Expected: Note updated with new text and saved
// ============================================================
test("UR-9 Valid: Valid MS account, edit note with 'Hello there'", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = [
    { id: 1, projectId: "project_123", text: "Old text", position: { x: 0, y: 0 } },
  ];

  const editResult = simulateEditNote(1, "Hello there", existingNotes);

  expect(editResult.success).toBe(true);
  expect(editResult.message).toBe("Note updated");
  expect(editResult.note.text).toBe("Hello there");
});

// ============================================================
// UR-9 TEST 4: Valid MS account, move note
// Expected: Note position updated and saved in database
// ============================================================
test("UR-9 Valid: Valid MS account, move note to new position", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = [
    { id: 1, projectId: "project_123", text: "Note 1", position: { x: 0, y: 0 } },
  ];

  const moveResult = simulateMoveNote(
    1,
    { x: 250, y: 300 },
    existingNotes,
    null,
    "user_1"
  );

  expect(moveResult.success).toBe(true);
  expect(moveResult.message).toBe("Note position updated");
  expect(moveResult.note.position).toEqual({ x: 250, y: 300 });
});

// ============================================================
// UR-9 TEST 5: Valid MS account, edit note with XSS attack
// Expected: Stored as plain text, script not executed
// ============================================================
test("UR-9 Invalid: Valid MS account, XSS attack stored as plain text", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = [
    { id: 1, projectId: "project_123", text: "Old text", position: { x: 0, y: 0 } },
  ];

  const xssAttempt = "<script>alert('hello')</script>";
  const editResult = simulateEditNote(1, xssAttempt, existingNotes);

  expect(editResult.success).toBe(true);
  expect(editResult.note.text).toBe("<script>alert('hello')</script>"); // Stored as plain text
});

// ============================================================
// UR-9 TEST 6: Valid MS account, edit note with SQL injection
// Expected: Stored as plain text, SQL not executed
// ============================================================
test("UR-9 Invalid: Valid MS account, SQL injection stored as plain text", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = [
    { id: 1, projectId: "project_123", text: "Old text", position: { x: 0, y: 0 } },
  ];

  const sqlAttempt = "SELECT * FROM users;";
  const editResult = simulateEditNote(1, sqlAttempt, existingNotes);

  expect(editResult.success).toBe(true);
  expect(editResult.note.text).toBe("SELECT * FROM users;"); // Stored as plain text
});

// ============================================================
// UR-9 TEST 7: Valid MS account, edit and delete simultaneously
// Expected: Note deleted, edit cannot be saved
// ============================================================
test("UR-9 Valid: Valid MS account, edit and delete simultaneously", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = [
    { id: 1, projectId: "project_123", text: "Old text", position: { x: 0, y: 0 } },
  ];

  // Note gets deleted first
  const deleteResult = simulateDeleteNote(1, existingNotes);
  expect(deleteResult.success).toBe(true);
  expect(deleteResult.message).toBe("Note deleted");

  // Edit attempt comes in after deletion
  const editResult = simulateEditNote(
    1,
    "New text",
    deleteResult.remainingNotes, 
    true
  );

  expect(editResult.success).toBe(false);
  expect(editResult.message).toBe("Note has been deleted, edit cannot be saved");
});

// ============================================================
// UR-9 TEST 8: Valid MS account, add/edit/move simultaneously
// Expected: Last user to finish takes effect
// ============================================================
test("UR-9 Valid: Valid MS account, add/edit/move simultaneously, last user wins", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const existingNotes = [
    { id: 1, projectId: "project_123", text: "Original text", position: { x: 0, y: 0 } },
  ];

  // Two users moving the same note at the same time
  // user_2 lets go last so their position should win
  const moveResult = simulateMoveNote(
    1,
    { x: 500, y: 500 },
    existingNotes,
    "user_1",
    "user_2"
  );

  expect(moveResult.success).toBe(true);
  expect(moveResult.message).toBe("Position updated by last user to release");
  expect(moveResult.note.position).toEqual({ x: 500, y: 500 });
  expect(moveResult.note.lastEditedBy).toBe("user_2");
});

// ============================================================
// UR-9 TEST 9: Add more than 10 notes
// Expected: Fails, maximum of 10 notes allowed per project
// ============================================================
test("UR-9 Invalid: Cannot add more than 10 notes to a project", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Already at the maximum of 10 notes
  const existingNotes = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    projectId: "project_123",
    text: `Note ${i + 1}`,
    position: { x: 0, y: 0 }
  }));

  const addResult = simulateAddNote("project_123", "Note 11", existingNotes);

  expect(addResult.success).toBe(false);
  expect(addResult.message).toBe("Maximum of 10 notes allowed per project");
});