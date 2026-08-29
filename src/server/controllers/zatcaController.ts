import type { Request, Response } from "express";
import { validateZatcaCompliance } from "../services/zatcaService";

export function postComplianceCheck(req: Request, res: Response) {
  try {
    const { invoiceHash, qrBase64, ublXml, isB2B } = req.body;
    const result = validateZatcaCompliance(invoiceHash, qrBase64, ublXml, isB2B);
    return res.status(result.statusCode).json(result.body);
  } catch {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An internal server error occurred." } });
  }
}
