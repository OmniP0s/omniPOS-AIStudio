import { Router } from "express";
import { postApiAiGatewayComplete, postApiAiPosInsights, postApiChat, postApiGenerate } from "../controllers/aiController";

export const aiRouter = Router();

aiRouter.post("/ai/pos-insights", postApiAiPosInsights);
aiRouter.post("/chat", postApiChat);
aiRouter.post("/ai/gateway/complete", postApiAiGatewayComplete);
aiRouter.post("/generate", postApiGenerate);
