import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.gemini" });

// gemini-2.5-flash is fast, cheap, and good enough for student Q&A.
// Swap to gemini-2.5-pro if you want higher quality at higher cost.
const DEFAULT_MODEL = "gemini-2.5-flash";

// The persona / behaviour rules that shape every reply.
const SYSTEM_INSTRUCTION = `
You are GCMS Assistant, an AI helper embedded in a university group-coursework
management app. You help students understand their coursework specifications,
summarise documents, and answer questions about their project.

Guidelines:
- Be concise. Students are busy.
- If you don't know the answer, say so plainly rather than inventing one.
- Do not write the coursework for the student; explain, summarise, clarify.
`.trim();

// Lazy client - only constructed on the first call. Importing this file
// does nothing on its own.
let _ai = null;
function getClient() {
    if (!_ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error(
                "GEMINI_API_KEY is not set. Add it to .env.gemini.",
            );
        }
        _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return _ai;
}

/**
 * Send a question to Gemini and get a reply back.
 *
 * @param {string} userMessage - what the user asked
 * @returns {Promise<string>}  - the assistant's reply text
 */
export async function getGeminiResponse(userMessage) {
    const result = await getClient().models.generateContent({
        model: DEFAULT_MODEL,
        contents: userMessage,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            maxOutputTokens: 800,
            temperature: 0.7,
        },
    });

    return result.text ?? "";
}