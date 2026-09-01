export const aiConfig = {
  enabled: () => process.env.AI_ENABLED?.trim().toLowerCase() === "true",
  models: {
    cashier: () => process.env.AI_MODEL_CASHIER || "gemini-3.7-flash",
    chat: () => process.env.AI_MODEL_CHAT || "gemini-3.7-flash",
    analytics: () => process.env.AI_MODEL_ANALYTICS || "gemini-3.7-flash",
  },
};
