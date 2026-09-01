import { GoogleGenAI } from "@google/genai";
import { aiConfig } from "../config/ai";

export type AiServiceErrorCode = "AI_DISABLED" | "AI_NOT_CONFIGURED";

export class AiServiceError extends Error {
  constructor(public readonly code: AiServiceErrorCode, message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

let aiClient: GoogleGenAI | null = null;

export function getAi(): GoogleGenAI {
  if (!aiConfig.enabled()) {
    throw new AiServiceError("AI_DISABLED", "AI features are not enabled.");
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiServiceError("AI_NOT_CONFIGURED", "GEMINI_API_KEY is required when AI features are enabled.");
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}
