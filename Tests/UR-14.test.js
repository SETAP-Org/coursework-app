// UR-14: Authenticated users should be able to discuss details about the documents
// within their shared OneDrive folder with an AI chatbot

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates checking if a user has access to a OneDrive folder
function simulateOneDriveAccess(userId, folderId, sharedFolders) {
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }
  if (!folderId) {
    return { success: false, message: "Folder ID is required" };
  }
  // Check if the folder is in the user's shared folders list
  const hasAccess = sharedFolders.some(
    folder => folder.folderId === folderId && folder.userId === userId
  );
  if (!hasAccess) {
    return { success: false, message: "Access denied, folder is not shared with this user" };
  }
  return { success: true, message: "Folder access granted" };
}

// Simulates fetching documents from a OneDrive folder
function simulateFetchDocuments(userId, folderId, sharedFolders) {
  // Check access first
  const accessResult = simulateOneDriveAccess(userId, folderId, sharedFolders);
  if (!accessResult.success) {
    return { success: false, message: accessResult.message, documents: [] };
  }
  // Return documents from folder
  return {
    success: true,
    message: "Documents fetched successfully",
    documents: [
      { id: "doc_1", name: "Project Report.pdf", content: "This report covers the project scope and deliverables." },
      { id: "doc_2", name: "Meeting Notes.docx", content: "Meeting notes from the 5th May 2026 sprint review." },
      { id: "doc_3", name: "Task Breakdown.xlsx", content: "Breakdown of tasks assigned to each team member." },
    ]
  };
}

// Simulates querying the AI chatbot about a document
function simulateAiQuery(userId, folderId, sharedFolders, question, conversationHistory = []) {
  if (!question || question.trim() === "") {
    return { success: false, message: "Question cannot be empty" };
  }

  // Check folder access before querying
  const accessResult = simulateOneDriveAccess(userId, folderId, sharedFolders);
  if (!accessResult.success) {
    return { success: false, message: "Access denied, chatbot cannot retrieve document content" };
  }

  // Fetch the documents the AI will use to answer
  const docsResult = simulateFetchDocuments(userId, folderId, sharedFolders);
  if (!docsResult.success || docsResult.documents.length === 0) {
    return { success: false, message: "No documents found to query" };
  }

  // Simulate AI response based on the question and document content
  const mockResponses = {
    "What is the project about?": "Based on the Project Report, the project covers the project scope and deliverables.",
    "Who attended the meeting?": "Based on the Meeting Notes, the meeting was held on 5th May 2026 as a sprint review.",
    "What tasks are assigned?": "Based on the Task Breakdown, tasks have been assigned to each team member.",
    "What did you just tell me?": "I told you about the meeting held on 5th May 2026 as a sprint review.", // Follow-up
  };

  // Check conversation history for context (follow-up question handling)
  const previousResponse = conversationHistory.length > 0
    ? conversationHistory[conversationHistory.length - 1]
    : null;

  const aiResponse = mockResponses[question] || "I could not find relevant information in the documents.";

  // Add the new exchange to conversation history
  const updatedHistory = [
    ...conversationHistory,
    { question, response: aiResponse }
  ];

  return {
    success: true,
    message: "AI response generated",
    question,
    response: aiResponse,
    basedOnDocuments: docsResult.documents.map(d => d.name),
    conversationHistory: updatedHistory,
    hadContext: previousResponse !== null
  };
}

// ============================================================
// UR-14 TEST 1: Valid MS account, documents present, user submits a question
// Expected: AI returns a relevant response based on document content
// ============================================================
test("UR-14 Valid: Valid MS account, AI chatbot returns relevant document response", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Shared folders the user has access to
  const sharedFolders = [
    { userId: "user_1", folderId: "folder_123" },
  ];

  const queryResult = simulateAiQuery(
    "user_1",
    "folder_123",
    sharedFolders,
    "What is the project about?", 
    []
  );

  expect(queryResult.success).toBe(true);
  expect(queryResult.message).toBe("AI response generated");
  expect(queryResult.response).toContain("Project Report");  
  expect(queryResult.basedOnDocuments).toContain("Project Report.pdf"); 
  expect(queryResult.conversationHistory.length).toBe(1); 
  expect(queryResult.hadContext).toBe(false); 
});

// ============================================================
// UR-14 TEST 2: Valid MS account, user submits a follow-up question
// Expected: AI retains context and responds accurately to the follow-up
// ============================================================
test("UR-14 Valid: Valid MS account, AI chatbot retains context for follow-up question", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const sharedFolders = [
    { userId: "user_1", folderId: "folder_123" },
  ];

  // First question
  const firstQuery = simulateAiQuery(
    "user_1",
    "folder_123",
    sharedFolders,
    "Who attended the meeting?",
    [] 
  );

  expect(firstQuery.success).toBe(true);
  expect(firstQuery.response).toContain("sprint review");
  expect(firstQuery.conversationHistory.length).toBe(1);
  expect(firstQuery.hadContext).toBe(false); 

  // Follow-up question using the conversation history from the first question
  const followUpQuery = simulateAiQuery(
    "user_1",
    "folder_123",
    sharedFolders,
    "What did you just tell me?",
    firstQuery.conversationHistory
  );

  expect(followUpQuery.success).toBe(true);
  expect(followUpQuery.hadContext).toBe(true);
  expect(followUpQuery.conversationHistory.length).toBe(2);
  expect(followUpQuery.response).toContain("sprint review");
});

// ============================================================
// UR-14 TEST 3: Valid MS account, user queries a folder they do not have access to
// Expected: Access denied, chatbot does not retrieve or expose document content
// ============================================================
test("UR-14 Invalid: Valid MS account, user queries unauthorised OneDrive folder", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // user_1 only has access to folder_123, NOT folder_999
  const sharedFolders = [
    { userId: "user_1", folderId: "folder_123" },
  ];

  const queryResult = simulateAiQuery(
    "user_1",
    "folder_999",
    sharedFolders,
    "What is in this folder?",
    []
  );

  expect(queryResult.success).toBe(false);
  expect(queryResult.message).toBe("Access denied, chatbot cannot retrieve document content");
});

// ============================================================
// UR-14 TEST 4: Valid MS account, user submits an empty question
// Expected: Fails, question cannot be empty
// ============================================================
test("UR-14 Invalid: Valid MS account, empty question submitted to AI chatbot", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const sharedFolders = [
    { userId: "user_1", folderId: "folder_123" },
  ];

  const queryResult = simulateAiQuery(
    "user_1",
    "folder_123",
    sharedFolders,
    "",
    []
  );

  expect(queryResult.success).toBe(false);
  expect(queryResult.message).toBe("Question cannot be empty");
});

// ============================================================
// UR-14 TEST 5: Valid MS account, multiple documents in folder, AI uses correct one
// Expected: AI references the most relevant document for the question
// ============================================================
test("UR-14 Valid: Valid MS account, AI references correct document for the question", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const sharedFolders = [
    { userId: "user_1", folderId: "folder_123" },
  ];

  // Ask about tasks specifically
  const queryResult = simulateAiQuery(
    "user_1",
    "folder_123",
    sharedFolders,
    "What tasks are assigned?",
    []
  );

  expect(queryResult.success).toBe(true);
  expect(queryResult.response).toContain("Task Breakdown");
  expect(queryResult.basedOnDocuments).toContain("Task Breakdown.xlsx");
});