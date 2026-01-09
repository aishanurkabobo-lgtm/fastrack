
import { GoogleGenAI, Type } from "@google/genai";
import { MotivationMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMotivationalMessage = async (streak: number, total: number): Promise<MotivationMessage> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user has a current exercise streak of ${streak} days and has worked out ${total} times in total. Generate a short, punchy motivational quote or tip to keep them going.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ["text", "author"]
        }
      }
    });

    return JSON.parse(response.text || '{"text": "Keep pushing, the results are worth it!", "author": "Fitness AI"}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "Consistency is the key to all success. Keep showing up.",
      author: "FitFocus AI"
    };
  }
};
