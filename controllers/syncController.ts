import { Request, Response } from "express";
import { commitOutboxMessage } from "../services/syncService";

export const postApiSyncOutbox = (req: Request, res: Response) => {
  try {
    const result = commitOutboxMessage(req.body.message);
    return res.status(result.statusCode).json(result.body);
  } catch {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An internal server error occurred." } });
  }
};

// ZATCA Phase 2 Sandbox Validation Endpoint
