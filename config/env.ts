import dotenv from "dotenv";

dotenv.config();

export function validateRequiredSecrets() {
  const missing: string[] = [];
  if (!process.env.API_AUTH_SECRET || process.env.API_AUTH_SECRET.length < 32) {
    missing.push("API_AUTH_SECRET (minimum 32 characters)");
  }
  if (!process.env.GEMINI_API_KEY) {
    missing.push("GEMINI_API_KEY");
  }
  if (missing.length > 0) {
    throw new Error(`Missing or invalid required secrets: ${missing.join(", ")}`);
  }
}
