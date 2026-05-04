// AI ROUTES
// All routes relating to AI functionality

import { Router } from "express";

// Controller Imports
import {
    getAiChatMessages,
    postAiChatMessage,
    clearAiChatHistory,
} from "../controllers/aiChatControllers.js";

// Middleware Imports
import { checkMembership } from "../controllers/projectControllers.js";

// Router Declaration
const router = Router();

// Routes
router.get(
    "/projects/:project_id/ai-chat",
    checkMembership,
    getAiChatMessages,
);

router.post(
    "/projects/:project_id/ai-chat",
    checkMembership,
    postAiChatMessage,
);

router.delete(
    "/projects/:project_id/ai-chat",
    checkMembership,
    clearAiChatHistory,
);
// Export Router
export default router;