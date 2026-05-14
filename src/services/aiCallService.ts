import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCallStrategy(lead: Lead, language: string = 'English') {
  const prompt = `Analyze this lead for a cold call automation:
  Name: ${lead.name}
  Industry: ${lead.industry}
  Priority: ${lead.priority}
  Website: ${lead.website}
  Target Language: ${language}
  
  Objective: Qualify this lead for our premium funnel management solution.
  
  Provide a JSON strategy containing:
  1. "opening": The first sentence the AI agent should say (in ${language}). If bilingual (e.g. Hindi and English), use natural Hinglish.
  2. "keyPoints": 3 points the AI must cover (in ${language}).
  3. "rebuttal": How to handle common objections (in ${language}).
  4. "closing": The call to action (in ${language}).
  
  IMPORTANT: Return raw JSON only. Use natural, conversational ${language}. For Hindi/English requests, prefer a professional yet friendly Hinglish style.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("AI Strategy Error:", error);
    const isQuotaExceeded = 
      error.message?.includes('quota') || 
      error.status === 429 ||
      error.error?.code === 429 ||
      error.error?.status === 'RESOURCE_EXHAUSTED';

    if (isQuotaExceeded) {
      return { error: 'QUOTA_EXCEEDED' };
    }
    return null;
  }
}

export async function generateAgentResponse(lead: Lead, history: any[], lastMessage: string, language: string) {
  const prompt = `You are an AI sales agent calling ${lead.name} (${lead.industry}).
  Current Language Context: ${language}
  
  Transcript so far:
  ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
  
  The lead just said: "${lastMessage}"
  
  Based on this, provide your next response in ${language}. 
  Be professional, handle any questions they asked, and try to steer them toward a meeting or next step.
  If the language is bilingual (Hindi/English), you can mix both naturally (Hinglish).
  Keep it under 2 sentences.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text.trim();
  } catch (err: any) {
    const isQuotaExceeded = 
      err.message?.includes('quota') || 
      err.status === 429 ||
      err.error?.code === 429 ||
      err.error?.status === 'RESOURCE_EXHAUSTED';

    if (isQuotaExceeded) {
       return "I'm sorry, my AI processing queue is full. Can we continue this manually or try again later?";
    }
    return "Understood. Can we schedule a brief follow-up to discuss this further?";
  }
}

export async function generateEmailFollowUp(lead: Lead, transcript: any[]) {
  const prompt = `Based on this call transcript with ${lead.name} from ${lead.industry}:
  
  Transcript:
  ${transcript.map(h => `${h.role}: ${h.text}`).join('\n')}
  
  Write a professional, concise follow-up email.
  Subject line included.
  Goal: Book a discovery meeting.
  Tone: Professional and helpful.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    return response.text.trim();
  } catch (err: any) {
    const isQuotaExceeded = 
      err.message?.includes('quota') || 
      err.status === 429 ||
      err.error?.code === 429 ||
      err.error?.status === 'RESOURCE_EXHAUSTED';

    if (isQuotaExceeded) {
      return "Follow-up email generation paused due to quota limits. Please review the call manually.";
    }
    return `Subject: Follow up - ${lead.industry}\n\nHi ${lead.name},\n\nIt was great speaking with you. Let's schedule a time to talk further.\n\nBest regards.`;
  }
}

export async function simulateLeadResponse(transcript: string, lead: Lead, language: string = 'English') {
  const prompt = `Act as the lead: ${lead.name} in a phone call.
  The AI sales agent just said: "${transcript}"
  Language Context: ${language}
  
  Provide a JSON response containing:
  1. "text": A short, 1-sentence response as the lead (in ${language}). Be realistic. If language is bilingual Hindi/English, you can respond in Hinglish.
  2. "sentiment": One of ["Positive", "Neutral", "Skeptical", "Frustrated", "Interested"].
  
  Current Lead Context: ${lead.industry} industry, website ${lead.website}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    const isQuotaExceeded = 
      error.message?.includes('quota') || 
      error.status === 429 ||
      error.error?.code === 429 ||
      error.error?.status === 'RESOURCE_EXHAUSTED';

    if (isQuotaExceeded) {
       return { text: "I'm sorry, I'm having trouble processing this call. Can we try again later?", sentiment: "Neutral" };
    }
    return { text: "I'm interested, tell me more.", sentiment: "Interested" };
  }
}
