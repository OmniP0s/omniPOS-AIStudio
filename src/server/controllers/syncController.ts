import type { Request, Response } from "express";
import { commitOutboxMessage } from "../services/syncService";

export function postOutbox(req: Request, res: Response) {
  try {
    const result = commitOutboxMessage(req.body.message);
    return res.status(result.statusCode).json(result.body);
  } catch {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An internal server error occurred." } });
  }
}
