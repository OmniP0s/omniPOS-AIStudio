import { Router } from "express";
import { postComplianceCheck } from "../controllers/zatcaController";

export const zatcaRouter = Router();

zatcaRouter.post("/compliance-check", postComplianceCheck);
