import { Router } from "express";
import {
  getApiHealth,
  getApiMetrics,
  postApiSyncOutbox,
  postApiZatcaComplianceCheck,
  postApiAiPosInsights,
  postApiChat,
  postApiAiGatewayComplete,
  postApiAiAppsExecutiveWhatIf,
  postApiAiAppsCashierVoiceParse,
  postApiAiAppsOrchestratorExecute,
  postApiGenerate,
  postApiAiAgentsWorkflowsRun,
  postApiAiAgentsApprovalsDecide,
  getApiAiAgentsKnowledgeGraphQuery,
  postApiAiAgentsToolsExecute,
  postApiAiAgentsEvaluationsRun,
  postApiCognitiveAiVoiceTranscribe,
  postApiCognitiveAiVoiceSynthesize,
  postApiCognitiveAiVoiceParseCommand,
  postApiCognitiveAiVisionOcr,
  getApiCognitiveAiVisionKitchenStream,
  postApiCognitiveAiCreativeGenerateImage,
  postApiCognitiveAiDigitalTwinSimulate,
} from "../controllers/apiController";

export const apiRouter = Router();

// Health check
apiRouter.get("/health", getApiHealth);

// Prometheus Telemetry Metrics Endpoint
apiRouter.get("/metrics", getApiMetrics);

// Outbox & Vector Clock Conflict Resolution Sync
apiRouter.post("/sync/outbox", postApiSyncOutbox);

// ZATCA Phase 2 Sandbox Validation Endpoint
apiRouter.post("/zatca/compliance-check", postApiZatcaComplianceCheck);

// AI Forecasting & Restaurant Intelligence (Powered by Gemini)
apiRouter.post("/ai/pos-insights", postApiAiPosInsights);

// Chat Endpoint (with streaming SSE support)
apiRouter.post("/chat", postApiChat);

// Enterprise AI Gateway Route
apiRouter.post("/ai/gateway/complete", postApiAiGatewayComplete);

// ==========================================
// SPRINT 3.1 ENTERPRISE AI APPLICATIONS ROUTES
// ==========================================
// 1. Executive AI Copilot
apiRouter.post("/ai-apps/executive/what-if", postApiAiAppsExecutiveWhatIf);

// 2. Cashier AI Voice Parser
apiRouter.post("/ai-apps/cashier/voice-parse", postApiAiAppsCashierVoiceParse);

// 3. Multi-Agent Orchestrator Execution
apiRouter.post("/ai-apps/orchestrator/execute", postApiAiAppsOrchestratorExecute);

// Dedicated Tool / Generator Endpoint
apiRouter.post("/generate", postApiGenerate);

// =========================================================================
// SPRINT 3.2: AUTONOMOUS AI AGENTS & DAG ORCHESTRATION ENDPOINTS
// =========================================================================
// Run autonomous business workflow
apiRouter.post("/ai-agents/workflows/run", postApiAiAgentsWorkflowsRun);

// Human Approval Gate Decision
apiRouter.post("/ai-agents/approvals/:id/decide", postApiAiAgentsApprovalsDecide);

// Knowledge Graph Semantic Query
apiRouter.get("/ai-agents/knowledge-graph/query", getApiAiAgentsKnowledgeGraphQuery);

// Tool Sandbox Execution
apiRouter.post("/ai-agents/tools/execute", postApiAiAgentsToolsExecute);

// AI Evaluation Benchmark Execution
apiRouter.post("/ai-agents/evaluations/run", postApiAiAgentsEvaluationsRun);

// =========================================================================
// SPRINT 3.3: COGNITIVE & MULTIMODAL AI ENDPOINTS (VOICE, VISION, DOCS, TWIN)
// =========================================================================
// Voice AI - Speech to Text Transcription
apiRouter.post("/cognitive-ai/voice/transcribe", postApiCognitiveAiVoiceTranscribe);

// Voice AI - Text to Speech Synthesis
apiRouter.post("/cognitive-ai/voice/synthesize", postApiCognitiveAiVoiceSynthesize);

// Voice AI - Voice Command Intent Parser
apiRouter.post("/cognitive-ai/voice/parse-command", postApiCognitiveAiVoiceParseCommand);

// Vision AI - Document & Receipt OCR
apiRouter.post("/cognitive-ai/vision/ocr", postApiCognitiveAiVisionOcr);

// Vision AI - Kitchen Camera Stream
apiRouter.get("/cognitive-ai/vision/kitchen-stream", getApiCognitiveAiVisionKitchenStream);

// Creative Studio - Generate Marketing Image
apiRouter.post("/cognitive-ai/creative/generate-image", postApiCognitiveAiCreativeGenerateImage);

// Digital Twin Simulation
apiRouter.post("/cognitive-ai/digital-twin/simulate", postApiCognitiveAiDigitalTwinSimulate);

