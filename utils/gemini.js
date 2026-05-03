import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.gemini" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getGeminiResponse(userMessage, systemInstruction) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction,
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
        },
    });

    const result = await model.generateContent(userMessage);

    return {
        text: result.response.text(),
        tokensUsed: {
            input: result.response.usageMetadata?.promptTokenCount || 0,
            output: result.response.usageMetadata?.candidatesTokenCount || 0,
            total: result.response.usageMetadata?.totalTokenCount || 0,
        },
    };
}
