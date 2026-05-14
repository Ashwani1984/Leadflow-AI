import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestLeadPriority(lead: Omit<Lead, 'id' | 'dateAdded' | 'avatar' | 'priority'>) {
  const prompt = `Based on the following lead information, suggest a priority level ('High', 'Medium', or 'Low') and provide a brief 1-sentence reason.
  Name: ${lead.name}
  Email: ${lead.email}
  Industry: ${lead.industry}
  Website: ${lead.website}
  
  High priority for established companies, tech sectors, or clear decision-maker titles.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          priority: {
            type: Type.STRING,
            enum: ["High", "Medium", "Low"],
            description: "Suggested priority level"
          },
          reason: {
            type: Type.STRING,
            description: "Brief reason for the priority level"
          }
        },
        required: ["priority", "reason"]
      }
    }
  }).catch((error: any) => {
    console.error("AI Priority Error:", error);
    const isQuotaExceeded = 
      error.message?.includes('quota') || 
      error.status === 429 ||
      error.error?.code === 429 ||
      error.error?.status === 'RESOURCE_EXHAUSTED';
    
    if (isQuotaExceeded) {
       return { response: { text: JSON.stringify({ priority: "Medium", reason: "AI resource limit reached. Automated priority queued." }) } };
    }
    throw error;
  });

  try {
    const text = (response as any).text || (response as any).response?.text?.();
    return JSON.parse(typeof text === 'function' ? text() : text);
  } catch (error) {
    console.error("Failed to parse AI priority suggestion", error);
    return { priority: "Medium", reason: "Standard processing recommended." };
  }
}

export async function generateLeadInsights(lead: Lead) {
  const prompt = `Based on the following lead information, generate 3 relevant talking points and 1 professional email draft for outreach.
  Name: ${lead.name}
  Email: ${lead.email}
  Industry: ${lead.industry}
  Website: ${lead.website}
  
  Focus on high-value conversion and research-backed personalization.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          talkingPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 key talking points for a discovery call"
          },
          emailSubject: {
            type: Type.STRING,
            description: "Compelling email subject line"
          },
          emailBody: {
            type: Type.STRING,
            description: "Personalized email draft body"
          }
        },
        required: ["talkingPoints", "emailSubject", "emailBody"]
      }
    }
  }).catch((error: any) => {
    console.error("AI Insights Error:", error);
    const isQuotaExceeded = 
      error.message?.includes('quota') || 
      error.status === 429 ||
      error.error?.code === 429 ||
      error.error?.status === 'RESOURCE_EXHAUSTED';
    
    if (isQuotaExceeded) {
       return { response: { text: JSON.stringify({ talkingPoints: ["Manual research required", "Quota limit reached", "Try again in 60s"], emailSubject: "Follow up", emailBody: "Quota limit reached. Please draft manually." }) } };
    }
    throw error;
  });

  try {
    const text = (response as any).text || (response as any).response?.text?.();
    return JSON.parse(typeof text === 'function' ? text() : text);
  } catch (error) {
    console.error("Failed to parse AI response", error);
    return null;
  }
}
