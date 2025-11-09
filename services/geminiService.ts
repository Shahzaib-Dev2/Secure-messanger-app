
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function enhanceMessage(message: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a secure messaging assistant. Rephrase the following message to sound more professional and formal. Return only the rephrased message, without any preamble, explanation, or quotation marks.
      
      Original message: "${message}"`,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
      },
    });

    const enhancedText = response.text.trim();
    return enhancedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not enhance message. Please try again.");
  }
}
