import { Router } from "express";
import { postApiAiAgentsWorkflowsRun, postApiAiAgentsApprovalsDecide, getApiAiAgentsKnowledgeGraphQuery, postApiAiAgentsToolsExecute, postApiAiAgentsEvaluationsRun } from "../controllers/aiAgentsController";

export const aiAgentsRouter = Router();

aiAgentsRouter.post("/workflows/run", postApiAiAgentsWorkflowsRun);
aiAgentsRouter.post("/approvals/:id/decide", postApiAiAgentsApprovalsDecide);
aiAgentsRouter.get("/knowledge-graph/query", getApiAiAgentsKnowledgeGraphQuery);
aiAgentsRouter.post("/tools/execute", postApiAiAgentsToolsExecute);
aiAgentsRouter.post("/evaluations/run", postApiAiAgentsEvaluationsRun);
