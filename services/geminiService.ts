import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysisResult } from '../types';

declare const process: any;
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const analyzeVideoContext = async (title: string, author: string, description?: string): Promise<AiAnalysisResult> => {
  try {
    const cleanDesc = description ? description.substring(0, 5000) : "No description available.";

    const prompt = `
      You are an expert video content curator. Analyze this YouTube video metadata:
      
      Title: "${title}"
      Channel: "${author}"
      Description: "${cleanDesc}"
      
      Task:
      1. Write a catchy "TL;DR" summary (max 3 sentences).
      2. Identify 3-4 distinct Key Topics or Tags.
      3. Generate 3 curious questions a viewer might ask.
      
      Return JSON.
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