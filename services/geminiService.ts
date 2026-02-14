import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysisResult } from '../types';

// Initialize the Gemini client
// The API Key is injected by Vite at build time via define: { 'process.env.API_KEY': ... }
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVideoContext = async (title: string, author: string, description?: string): Promise<AiAnalysisResult> => {
  try {
    // Truncate description to avoid token limits if it's massive
    const cleanDesc = description ? description.substring(0, 5000) : "No description available.";

    const prompt = `
      You are an expert video content analyst. Analyze the following YouTube video metadata:
      
      Title: "${title}"
      Channel: "${author}"
      Description: "${cleanDesc}"
      
      Task:
      1. Write a comprehensive summary of what this video is about. Use the description to be accurate.
      2. Identify 3-4 key topics or tags.
      3. Generate 3 curious questions a viewer might ask after watching.
      
      Return the response strictly as a JSON object.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['summary', 'topics', 'suggestedQuestions']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AiAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "I couldn't analyze this video right now. It might be age-restricted or private.",
      topics: ["Analysis unavailable"],
      suggestedQuestions: ["Try another video?"]
    };
  }
};