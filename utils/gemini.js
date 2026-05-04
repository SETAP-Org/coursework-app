import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.gemini" });


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// function to send a message to Gemini and get the response and system instruction
export async function getGeminiResponse(userMessage, systemInstruction) {
    // Configure the model for this request
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        // function to control Gemii's behaviour still to be done   
        systemInstruction,           
        generationConfig: {
            maxOutputTokens: 500,    
            temperature: 0.7,        // refers to the AI's creativity
        },
    });

    // Send the user's message and wait for Gemini's reply
    const result = await model.generateContent(userMessage);

    return {
        text: result.response.text(),   // the AI's response 
        tokensUsed: {
            // token counts from Gemini fall back to 0 if not provided
            input: result.response.usageMetadata?.promptTokenCount || 0,
            output: result.response.usageMetadata?.candidatesTokenCount || 0,
            total: result.response.usageMetadata?.totalTokenCount || 0,
        },
    };
}
