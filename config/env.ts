import dotenv from "dotenv";

dotenv.config();

export const serverConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  environment: process.env.NODE_ENV || "production",
};

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
