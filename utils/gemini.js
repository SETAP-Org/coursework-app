import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.gemini" });

// gemini-2.5-flash is fast, cheap, and good enough for student Q&A.
// Swap to gemini-2.5-pro if you want higher quality at higher cost.
const DEFAULT_MODEL = "gemini-2.5-flash";

// Mime types we're happy to forward to Gemini. 
const SUPPORTED_INLINE_MIME_TYPES = new Set([
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/csv",
    "text/html",
]);
// Hard cap on the total bytes we'll attach to a single request.
const MAX_INLINE_BYTES = 15 * 1024 * 1024;   // 15 MB

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

/**
 * Like getGeminiResponse, but also attaches a list of files so Gemini can
 * reason about their contents.
 *
 * @param {string} userMessage  - the user's question
 * @param {Array<{name: string, mimeType: string, data: Buffer}>} files
 *                              - files to attach
 * @returns {Promise<string>}   - the assistant's reply
 */
export async function getGeminiResponseWithFiles(userMessage, files = []) {
    // Step 1 - filter and budget the files.
    const includedFiles = [];
    const skippedFiles = [];
    let runningSize = 0;

    for (const file of files) {
        if (!file?.data || !file?.mimeType) continue;

        if (!SUPPORTED_INLINE_MIME_TYPES.has(file.mimeType)) {
            skippedFiles.push(`${file.name} (unsupported type ${file.mimeType})`);
            continue;
        }

        const size = file.data.length;
        if (runningSize + size > MAX_INLINE_BYTES) {
            skippedFiles.push(`${file.name} (would exceed size budget)`);
            continue;
        }

        runningSize += size;
        includedFiles.push(file);
    }

    // Step 2 - build the message parts: text prompt first, then each file
    // as inline base64 data.
    const promptText = skippedFiles.length
        ? `${userMessage}\n\n(Note: these files were not attached because they ` +
          `are unsupported or too large: ${skippedFiles.join(", ")}.)`
        : userMessage;

    const parts = [{ text: promptText }];
    for (const file of includedFiles) {
        parts.push({
            inlineData: {
                mimeType: file.mimeType,
                data: file.data.toString("base64"),
            },
        });
    }

    // Step 3 - send to Gemini and return the reply.
    const result = await getClient().models.generateContent({
        model: DEFAULT_MODEL,
        contents: parts,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            maxOutputTokens: 800,
            temperature: 0.7,
        },
    });

    return result.text ?? "";
}

