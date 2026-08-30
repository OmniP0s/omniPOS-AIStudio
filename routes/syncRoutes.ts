import { Router } from "express";
import { postApiSyncOutbox } from "../controllers/syncController";

export const syncRouter = Router();

syncRouter.post("/outbox", postApiSyncOutbox);
