import { Router } from "express";
import { postApiAiAppsExecutiveWhatIf, postApiAiAppsCashierVoiceParse, postApiAiAppsOrchestratorExecute } from "../controllers/aiAppsController";

export const aiAppsRouter = Router();

aiAppsRouter.post("/executive/what-if", postApiAiAppsExecutiveWhatIf);
aiAppsRouter.post("/cashier/voice-parse", postApiAiAppsCashierVoiceParse);
aiAppsRouter.post("/orchestrator/execute", postApiAiAppsOrchestratorExecute);
