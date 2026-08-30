import { Router } from "express";
import { postApiZatcaComplianceCheck } from "../controllers/zatcaController";

export const zatcaRouter = Router();

zatcaRouter.post("/compliance-check", postApiZatcaComplianceCheck);
