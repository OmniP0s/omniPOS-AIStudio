/**
 * OmniPOS Enterprise AI Security Layer (Zero-Trust AI Shield)
 * Prompt Injection/Jailbreak Detection, PII Masking, Secret Stripping & Output Guardrails
 */

import {
  SecurityScanResult,
  OutputGuardrailResult,
} from '../types';

export class EnterpriseAiSecurityLayer {
  private injectionPatterns: { pattern: RegExp; riskScore: number; reason: string }[] = [
    { pattern: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i, riskScore: 95, reason: 'Direct instruction override attempt' },
    { pattern: /system\s+(prompt|override|command|mode)/i, riskScore: 85, reason: 'System mode spoofing' },
    { pattern: /you\s+are\s+now\s+in\s+developer\s+mode/i, riskScore: 90, reason: 'Developer mode jailbreak' },
    { pattern: /do\s+anything\s+now|DAN\s+mode/i, riskScore: 99, reason: 'DAN jailbreak pattern' },
    { pattern: /reveal\s+(your\s+)?(system|internal|secret)\s+(prompt|key|token)/i, riskScore: 90, reason: 'System prompt/secret extraction' },
    { pattern: /bypass\s+(safety|security|policy|zatca|audit)/i, riskScore: 88, reason: 'Security filter bypass attempt' },
    { pattern: /drop\s+table|delete\s+from\s+tenant/i, riskScore: 95, reason: 'SQL injection payload in AI context' },
  ];

  // Regex patterns for sensitive data
  private piiPatterns = {
    // Saudi National ID / Iqama (10 digits starting with 1 or 2)
    SAUDI_NATIONAL_ID: /\b[12]\d{9}\b/g,
    // Credit Card (13-19 digits, formatted with spaces/dashes)
    CREDIT_CARD_PAN: /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{16}\b/g,
    // Saudi IBAN (SA followed by 22 alphanumeric digits)
    SAUDI_IBAN: /\bSA\d{2}[A-Z0-9]{20}\b/gi,
    // Saudi / GCC Phone numbers
    PHONE_NUMBER: /\b(?:\+966|00966|05)\d{8}\b/g,
    // Email addresses
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  };

  private secretPatterns = {
    API_KEY: /\b(?:sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[A-Za-z0-9]{36})\b/g,
    BEARER_TOKEN: /\bBearer\s+[A-Za-z0-9\-_.]+\.[A-Za-z0-9\-_.]+\.[A-Za-z0-9\-_.]+\b/gi,
    PRIVATE_KEY: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
  };

  public scanInputPrompt(rawPrompt: string): SecurityScanResult {
    let injectionRiskScore = 0;
    let jailbreakDetected = false;
    const blockedReasons: string[] = [];
    const deidentificationMap: Record<string, string> = {};

    // 1. Scan for Prompt Injections & Jailbreaks
    for (const item of this.injectionPatterns) {
      if (item.pattern.test(rawPrompt)) {
        injectionRiskScore = Math.max(injectionRiskScore, item.riskScore);
        blockedReasons.push(item.reason);
        if (item.riskScore >= 85) {
          jailbreakDetected = true;
        }
      }
    }

    let cleaned = rawPrompt;
    const piiRedacted: SecurityScanResult['piiRedacted'] = [];
    const secretsDetected: SecurityScanResult['secretsDetected'] = [];

    // 2. Scan & Strip Secrets (API Keys, Bearer tokens, Private keys)
    let secretCount = 0;
    cleaned = cleaned.replace(this.secretPatterns.PRIVATE_KEY, () => {
      secretCount++;
      return '[REDACTED_CRYPTO_PRIVATE_KEY]';
    });
    cleaned = cleaned.replace(this.secretPatterns.BEARER_TOKEN, () => {
      secretCount++;
      return 'Bearer [REDACTED_JWT_TOKEN]';
    });
    cleaned = cleaned.replace(this.secretPatterns.API_KEY, () => {
      secretCount++;
      return '[REDACTED_API_KEY]';
    });
    if (secretCount > 0) {
      secretsDetected.push({ secretType: 'API_KEY', count: secretCount });
    }

    // 3. Scan & Mask PII with reversible tokens
    // Saudi National ID
    let natIdCount = 0;
    cleaned = cleaned.replace(this.piiPatterns.SAUDI_NATIONAL_ID, match => {
      natIdCount++;
      const placeholder = `[REDACTED_NATIONAL_ID_${natIdCount}]`;
      deidentificationMap[placeholder] = match;
      return placeholder;
    });
    if (natIdCount > 0) {
      piiRedacted.push({ originalType: 'NATIONAL_ID', maskedCount: natIdCount, sampleTokens: [`[REDACTED_NATIONAL_ID]`] });
    }

    // Credit Card PAN
    let panCount = 0;
    cleaned = cleaned.replace(this.piiPatterns.CREDIT_CARD_PAN, match => {
      panCount++;
      const placeholder = `[REDACTED_PAN_CARD_${panCount}]`;
      deidentificationMap[placeholder] = match;
      return placeholder;
    });
    if (panCount > 0) {
      piiRedacted.push({ originalType: 'PAN_CARD', maskedCount: panCount, sampleTokens: [`[REDACTED_PAN_CARD]`] });
    }

    // IBAN
    let ibanCount = 0;
    cleaned = cleaned.replace(this.piiPatterns.SAUDI_IBAN, match => {
      ibanCount++;
      const placeholder = `[REDACTED_IBAN_${ibanCount}]`;
      deidentificationMap[placeholder] = match;
      return placeholder;
    });
    if (ibanCount > 0) {
      piiRedacted.push({ originalType: 'IBAN', maskedCount: ibanCount, sampleTokens: [`[REDACTED_IBAN]`] });
    }

    // Phone Numbers
    let phoneCount = 0;
    cleaned = cleaned.replace(this.piiPatterns.PHONE_NUMBER, match => {
      phoneCount++;
      const placeholder = `[REDACTED_PHONE_${phoneCount}]`;
      deidentificationMap[placeholder] = match;
      return placeholder;
    });
    if (phoneCount > 0) {
      piiRedacted.push({ originalType: 'PHONE', maskedCount: phoneCount, sampleTokens: [`[REDACTED_PHONE]`] });
    }

    // Emails
    let emailCount = 0;
    cleaned = cleaned.replace(this.piiPatterns.EMAIL, match => {
      emailCount++;
      const placeholder = `[REDACTED_EMAIL_${emailCount}]`;
      deidentificationMap[placeholder] = match;
      return placeholder;
    });
    if (emailCount > 0) {
      piiRedacted.push({ originalType: 'EMAIL', maskedCount: emailCount, sampleTokens: [`[REDACTED_EMAIL]`] });
    }

    const isSafe = !jailbreakDetected && injectionRiskScore < 80;

    return {
      isSafe,
      blockedReasons,
      injectionRiskScore,
      jailbreakDetected,
      piiRedacted,
      secretsDetected,
      cleanedPrompt: cleaned,
      deidentificationMap,
    };
  }

  public validateOutput(
    rawOutput: string,
    expectedJsonSchema?: Record<string, any>
  ): OutputGuardrailResult {
    let isValid = true;
    let schemaCompliant = true;
    const policyViolations: string[] = [];
    let hallucinationScore = 5; // Base minimal score

    // Check JSON adherence if required
    if (expectedJsonSchema) {
      try {
        const parsed = JSON.parse(rawOutput);
        for (const reqKey of (expectedJsonSchema.required || [])) {
          if (parsed[reqKey] === undefined) {
            schemaCompliant = false;
            isValid = false;
            policyViolations.push(`Missing required schema property: '${reqKey}'`);
          }
        }
      } catch {
        schemaCompliant = false;
        isValid = false;
        policyViolations.push('Output failed JSON schema validation parser.');
      }
    }

    // Heuristic: check for ungrounded non-sequiturs or hallucinated phrases
    if (rawOutput.includes('As an AI language model, I do not have access')) {
      hallucinationScore += 30;
      policyViolations.push('Generic hedging artifact detected.');
    }

    return {
      isValid,
      hallucinationScore,
      schemaCompliant,
      policyViolations,
      sanitizedOutput: rawOutput,
    };
  }
}

export const aiSecurityLayer = new EnterpriseAiSecurityLayer();
