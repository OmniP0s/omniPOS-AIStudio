// Enterprise Cryptographic Service Port Contracts
// Supports WebCrypto, Cloud KMS, and Hardware Security Modules (HSM) for ZATCA Phase 2

export interface CryptographicKeyPair {
  publicKeyPem: string;
  privateKeyReference: string; // In HSM/KMS this is an ARN or Key URI
  algorithm: 'ECDSA_SECP256K1' | 'ECDSA_SECP256R1' | 'RSA_2048';
}

export interface ICryptoService {
  signSha256(data: string | Uint8Array, privateKeyRef: string): Promise<string>; // Returns Base64 or DER hex
  verifySha256(data: string | Uint8Array, signature: string, publicKeyPem: string): Promise<boolean>;
  computeSha256Hash(data: string | Uint8Array): Promise<string>; // Returns Base64 hash
  generateCSR(config: {
    commonName: string;
    organizationUnit: string;
    organizationName: string;
    country: string;
    egsSerialNumber: string;
  }): Promise<{ csrPem: string; privateKeyRef: string }>;
}

export interface ICSIDVault {
  getCSIDCertificate(tenantId: string, branchId: string, egsSerialNumber: string): Promise<string | null>;
  storeCSIDCertificate(tenantId: string, branchId: string, egsSerialNumber: string, certificatePem: string): Promise<void>;
  getCSIDSecret(tenantId: string, branchId: string): Promise<string | null>;
}
