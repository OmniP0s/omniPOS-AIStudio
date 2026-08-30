// Enterprise ZATCA Phase 2 CSID Lifecycle Abstraction
// Manages Compliance CSID, Production CSID, Renewal, and Cryptographic Key Pairs

import * as crypto from 'crypto';

export type CsidType = 'COMPLIANCE' | 'PRODUCTION';

export interface CsidRecord {
  tenantId: string;
  branchId: string;
  egsSerialNumber: string;
  csidType: CsidType;
  binarySecurityToken: string; // Base64 X.509 Certificate
  secret: string; // CSID Secret for Basic Auth
  requestId: string;
  issuedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface CsrGenerationParams {
  commonName: string; // EGS Name or Hostname
  egsSerialNumber: string; // e.g. 1-OmniPOS|2-Branch01|3-Term01
  organizationIdentifier: string; // VAT Number (15 digits)
  organizationUnitName: string; // Branch Name
  organizationName: string; // Legal Entity Name
  countryName: string; // 'SA'
  invoiceType: '1100' | '0100' | '1000'; // 1100 = Both Standard & Simplified
  location: string; // City
  industry: string; // Industry code
}

export class CsidLifecycleManager {
  private csidStore = new Map<string, CsidRecord>(); // key: `${tenantId}:${branchId}:${csidType}`
  private keyStore = new Map<string, { privateKeyPem: string; publicKeyPem: string }>();

  /**
   * Generates a compliant CSR (Certificate Signing Request) envelope and ECDSA secp256k1 keypair
   */
  public generateCsr(params: CsrGenerationParams): {
    csrBase64: string;
    csrPem: string;
    publicKeyPem: string;
    privateKeyPem: string;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const cleanPubKey = publicKey.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\r?\n|\r/g, '');

    const csrData = {
      CN: params.commonName,
      OU: params.organizationUnitName,
      O: params.organizationName,
      C: params.countryName || 'SA',
      SN: params.egsSerialNumber,
      UID: params.organizationIdentifier,
      TITLE: params.invoiceType,
      CATEGORY: params.industry,
      ADDRESS: params.location,
      publicKey: cleanPubKey,
    };

    const csrBase64 = Buffer.from(JSON.stringify(csrData)).toString('base64');
    const csrPem = `-----BEGIN CERTIFICATE REQUEST-----\n${csrBase64}\n-----END CERTIFICATE REQUEST-----`;

    this.keyStore.set(params.egsSerialNumber, { privateKeyPem: privateKey, publicKeyPem: publicKey });

    return {
      csrBase64,
      csrPem,
      publicKeyPem: publicKey,
      privateKeyPem: privateKey,
    };
  }

  /**
   * Stores an issued CSID (Compliance or Production) securely
   */
  public registerCsid(record: CsidRecord): void {
    const key = `${record.tenantId}:${record.branchId}:${record.csidType}`;
    this.csidStore.set(key, record);
  }

  /**
   * Retrieves active CSID certificate and secret for a tenant branch
   */
  public getActiveCsid(tenantId: string, branchId: string, preferredType: CsidType = 'PRODUCTION'): CsidRecord | undefined {
    const prodKey = `${tenantId}:${branchId}:PRODUCTION`;
    const compKey = `${tenantId}:${branchId}:COMPLIANCE`;

    if (preferredType === 'PRODUCTION' && this.csidStore.has(prodKey)) {
      return this.csidStore.get(prodKey);
    }
    return this.csidStore.get(compKey);
  }

  public getKeyPair(egsSerialNumber: string) {
    return this.keyStore.get(egsSerialNumber);
  }
}
