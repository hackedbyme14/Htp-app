
import { GoogleGenAI } from "@google/genai";
import { ProductivityData } from '../types';

interface AISuggestion {
  bestTime: string;
  reason: string;
}

export const getAISuggestionForWorkTime = async (
  pastData: ProductivityData[],
): Promise<AISuggestion | undefined> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not defined. Cannot call Gemini API.");
    return undefined;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Based on the following productivity data, suggest the best time of day to work or study and provide a brief reason. The data is an array of objects, each with a 'date' (YYYY-MM-DD), 'completedTasks' (number), and 'focusMinutes' (number). Analyze trends to find optimal periods.
  
  Productivity Data:
  ${JSON.stringify(pastData, null, 2)}
  
  Provide the suggestion in a JSON format with 'bestTime' (e.g., 'Morning', 'Afternoon', 'Evening', 'Late Night') and 'reason' (string).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            bestTime: {
              type: "STRING",
              description: 'Suggested best time of day (e.g., Morning, Afternoon, Evening, Late Night).',
            },
            reason: {
              type: "STRING",
              description: 'Brief reason for the suggestion.',
            },
          },
          required: ["bestTime", "reason"],
          propertyOrdering: ["bestTime", "reason"],
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as AISuggestion;
  } catch (error) {
    console.error("Error fetching AI suggestion:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      console.warn("API key might be invalid or not selected. Please ensure a valid API key is set.");
      // Optional: If using the API key selection mechanism, you might want to prompt the user here.
      // await window.aistudio.openSelectKey();
    }
    return undefined;
  }
};
