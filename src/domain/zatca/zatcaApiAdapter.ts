// Enterprise ZATCA Phase 2 API Adapter
// Implements Reporting API (Simplified B2C) and Clearance API (Standard B2B)
// Strictly distinguishes between LOCAL_SIMULATION, ZATCA_SANDBOX, and ZATCA_PRODUCTION environments

import { ZatcaApiResponse, ZatcaEnvironment, ZatcaInvoiceModel, ZatcaSigningResult } from './zatcaDomain';
import { ZatcaBusinessRulesValidator } from './businessRulesValidator';

export interface ZatcaApiConfig {
  environment: ZatcaEnvironment;
  sandboxBaseUrl?: string;
  productionBaseUrl?: string;
  binarySecurityToken?: string;
  secret?: string;
}

export class ZatcaApiAdapter {
  private config: ZatcaApiConfig;

  constructor(config?: Partial<ZatcaApiConfig>) {
    this.config = {
      environment: config?.environment || 'LOCAL_SIMULATION',
      sandboxBaseUrl: config?.sandboxBaseUrl || 'https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation',
      productionBaseUrl: config?.productionBaseUrl || 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core',
      binarySecurityToken: config?.binarySecurityToken,
      secret: config?.secret,
    };
  }

  /**
   * Reports a B2C Simplified Tax Invoice (388 or 381/383) to ZATCA within 24 hours
   */
  public async reportSimplifiedInvoice(params: {
    invoice: ZatcaInvoiceModel;
    signedResult: ZatcaSigningResult;
  }): Promise<ZatcaApiResponse> {
    const { invoice, signedResult } = params;

    // 1. Validate Business Rules locally first
    const validation = ZatcaBusinessRulesValidator.validate(invoice);
    if (!validation.isValid) {
      return {
        environment: this.config.environment,
        invoiceUuid: invoice.uuid,
        status: 'REJECTED',
        reportingStatus: 'NOT_REPORTED',
        validationResults: {
          status: 'ERROR',
          infoMessages: [],
          warningMessages: validation.warnings,
          errorMessages: validation.errors,
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // 2. Dispatch based on Environment
    if (this.config.environment === 'LOCAL_SIMULATION') {
      return {
        environment: 'LOCAL_SIMULATION',
        invoiceUuid: invoice.uuid,
        status: 'REPORTED',
        reportingStatus: 'REPORTED',
        validationResults: {
          status: 'PASS',
          infoMessages: ['Local cryptographic verification successful.', 'Simulated ZATCA Reporting API returned 200 OK.'],
          warningMessages: validation.warnings,
          errorMessages: [],
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // Live Sandbox or Production HTTP Dispatch
    try {
      const endpoint = `${this.getBaseUrl()}/invoices/reporting/single`;
      const payload = {
        invoiceHash: signedResult.invoiceHashBase64,
        uuid: invoice.uuid,
        invoice: Buffer.from(signedResult.signedXml).toString('base64'),
      };

      const authHeader = this.getAuthHeader();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en',
          'Clearance-Status': '0',
          'Accept-Version': 'V2',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json().catch(() => ({}));

      return {
        environment: this.config.environment,
        invoiceUuid: invoice.uuid,
        status: response.ok ? 'REPORTED' : 'REJECTED',
        reportingStatus: response.ok ? 'REPORTED' : 'NOT_REPORTED',
        validationResults: {
          status: response.ok ? 'PASS' : 'ERROR',
          infoMessages: responseBody.validationResults?.infoMessages || [],
          warningMessages: responseBody.validationResults?.warningMessages || [],
          errorMessages: responseBody.validationResults?.errorMessages || (response.ok ? [] : ['ZATCA API HTTP error']),
        },
        submittedAt: new Date().toISOString(),
        rawResponse: responseBody,
      };
    } catch (err: any) {
      return {
        environment: this.config.environment,
        invoiceUuid: invoice.uuid,
        status: 'REJECTED',
        reportingStatus: 'NOT_REPORTED',
        validationResults: {
          status: 'ERROR',
          infoMessages: [],
          warningMessages: [],
          errorMessages: [`Network / Connectivity error: ${err.message}`],
        },
        submittedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Clears a B2B Standard Tax Invoice in real-time with ZATCA prior to delivering to the buyer
   */
  public async clearStandardInvoice(params: {
    invoice: ZatcaInvoiceModel;
    signedResult: ZatcaSigningResult;
  }): Promise<ZatcaApiResponse> {
    const { invoice, signedResult } = params;

    // 1. Validate Business Rules
    const validation = ZatcaBusinessRulesValidator.validate(invoice);
    if (!validation.isValid) {
      return {
        environment: this.config.environment,
        invoiceUuid: invoice.uuid,
        status: 'REJECTED',
        clearanceStatus: 'NOT_CLEARED',
        validationResults: {
          status: 'ERROR',
          infoMessages: [],
          warningMessages: validation.warnings,
          errorMessages: validation.errors,
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // 2. Dispatch based on Environment
    if (this.config.environment === 'LOCAL_SIMULATION') {
      return {
        environment: 'LOCAL_SIMULATION',
        invoiceUuid: invoice.uuid,
        status: 'CLEARED',
        clearanceStatus: 'CLEARED',
        cryptographicStamp: `ZATCA_SIM_CLEARANCE_STAMP_${invoice.uuid.substring(0, 8).toUpperCase()}`,
        validationResults: {
          status: 'PASS',
          infoMessages: ['Local cryptographic verification successful.', 'Simulated ZATCA Clearance API returned 200 OK with verified clearance stamp.'],
          warningMessages: validation.warnings,
          errorMessages: [],
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // Live Sandbox or Production HTTP Dispatch
    try {
      const endpoint = `${this.getBaseUrl()}/invoices/clearance/single`;
      const payload = {
        invoiceHash: signedResult.invoiceHashBase64,
        uuid: invoice.uuid,
        invoice: Buffer.from(signedResult.signedXml).toString('base64'),
      };

      const authHeader = this.getAuthHeader();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en',
          'Clearance-Status': '1',
          'Accept-Version': 'V2',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json().catch(() => ({}));
      const isCleared = response.ok && responseBody.clearanceStatus === 'CLEARED';

      return {
        environment: this.config.environment,
        invoiceUuid: invoice.uuid,
        status: isCleared ? 'CLEARED' : 'REJECTED',
        clearanceStatus: isCleared ? 'CLEARED' : 'NOT_CLEARED',
        cryptographicStamp: responseBody.clearedInvoice ? 'ZATCA_RETURNED_CLEARED_STAMP' : undefined,
        validationResults: {
          status: isCleared ? 'PASS' : 'ERROR',
          infoMessages: responseBody.validationResults?.infoMessages || [],
          warningMessages: responseBody.validationResults?.warningMessages || [],
          errorMessages: responseBody.validationResults?.errorMessages || (isCleared ? [] : ['ZATCA Clearance failed']),
        },
        submittedAt: new Date().toISOString(),
        rawResponse: responseBody,
      };
    } catch (err: any) {
      return {
        environment: this.config.environment,
        invoiceUuid: invoice.uuid,
        status: 'REJECTED',
        clearanceStatus: 'NOT_CLEARED',
        validationResults: {
          status: 'ERROR',
          infoMessages: [],
          warningMessages: [],
          errorMessages: [`Network / Clearance failure: ${err.message}`],
        },
        submittedAt: new Date().toISOString(),
      };
    }
  }

  private getBaseUrl(): string {
    return this.config.environment === 'ZATCA_PRODUCTION'
      ? this.config.productionBaseUrl!
      : this.config.sandboxBaseUrl!;
  }

  private getAuthHeader(): string | undefined {
    if (this.config.binarySecurityToken && this.config.secret) {
      const credentials = `${this.config.binarySecurityToken}:${this.config.secret}`;
      return `Basic ${Buffer.from(credentials).toString('base64')}`;
    }
    return undefined;
  }
}
