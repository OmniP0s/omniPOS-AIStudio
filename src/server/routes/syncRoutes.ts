import { Router } from "express";
import { postOutbox } from "../controllers/syncController";

export const syncRouter = Router();

syncRouter.post("/outbox", postOutbox);
