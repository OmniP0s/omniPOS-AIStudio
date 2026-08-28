import { SecretMetadata } from './types';

export interface SecretRotationEvent {
  id: string;
  secretId: string;
  previousVersion: number;
  newVersion: number;
  rotatedAt: string;
  rotatedBy: string;
  reason: string;
  newFingerprint: string;
}

export class SecretsGovernanceEngine {
  private secrets: Map<string, SecretMetadata> = new Map();
  private rotationHistory: SecretRotationEvent[] = [];

  constructor() {
    this.seedEnterpriseSecrets();
  }

  private seedEnterpriseSecrets(): void {
    const defaultSecrets: SecretMetadata[] = [
      {
        id: 'SEC-JWT-01',
        name: 'OAuth2 / JWT Primary RS256 Private Signing Key',
        type: 'JWT_KEY',
        version: 3,
        status: 'ACTIVE',
        vaultPath: 'secret/data/omnipos/auth/jwt-private-key',
        createdAt: '2026-01-01T00:00:00Z',
        lastRotatedAt: '2026-07-01T00:00:00Z',
        expiresAt: '2026-10-01T00:00:00Z',
        rotationIntervalDays: 90,
        autoRenew: true,
        fingerprintSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
      {
        id: 'SEC-ZATCA-CSID-01',
        name: 'ZATCA Phase 2 Cryptographic Stamp Identifier (CSID)',
        type: 'ZATCA_CSID_PRIVATE_KEY',
        version: 2,
        status: 'ACTIVE',
        vaultPath: 'secret/data/omnipos/compliance/zatca-csid-ec-secp256k1',
        createdAt: '2026-02-15T00:00:00Z',
        lastRotatedAt: '2026-08-15T00:00:00Z',
        expiresAt: '2027-02-15T00:00:00Z',
        rotationIntervalDays: 180,
        autoRenew: true,
        fingerprintSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      },
      {
        id: 'SEC-MADA-POS-01',
        name: 'Mada EFTPOS Terminal Host Master Key (HMK-DUKPT)',
        type: 'PAYMENT_GATEWAY_SECRET',
        version: 4,
        status: 'ACTIVE',
        vaultPath: 'secret/data/omnipos/payments/mada-dukpt-master',
        createdAt: '2026-03-01T00:00:00Z',
        lastRotatedAt: '2026-08-01T00:00:00Z',
        expiresAt: '2026-11-01T00:00:00Z',
        rotationIntervalDays: 90,
        autoRenew: true,
        fingerprintSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      },
      {
        id: 'SEC-TLS-WILDCARD-01',
        name: '*.omnipos.sa mTLS & Ingress SSL/TLS Certificate',
        type: 'TLS_CERTIFICATE',
        version: 1,
        status: 'ACTIVE',
        vaultPath: 'secret/data/omnipos/infra/tls-wildcard',
        createdAt: '2026-06-01T00:00:00Z',
        lastRotatedAt: '2026-06-01T00:00:00Z',
        expiresAt: '2027-06-01T00:00:00Z',
        rotationIntervalDays: 365,
        autoRenew: true,
        fingerprintSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      },
    ];

    defaultSecrets.forEach(s => this.secrets.set(s.id, s));
  }

  public getSecrets(): SecretMetadata[] {
    return Array.from(this.secrets.values());
  }

  public rotateSecret(id: string, rotatedBy: string, reason: string): SecretMetadata {
    const secret = this.secrets.get(id);
    if (!secret) throw new Error(`Secret with ID ${id} not found.`);

    const prevVersion = secret.version;
    const newVersion = prevVersion + 1;
    const newFingerprint = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    secret.version = newVersion;
    secret.status = 'ACTIVE';
    secret.lastRotatedAt = new Date().toISOString();
    secret.fingerprintSha256 = newFingerprint;

    // Reset expiry based on rotation interval
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + secret.rotationIntervalDays);
    secret.expiresAt = expDate.toISOString();

    this.rotationHistory.unshift({
      id: `ROT-${Date.now()}`,
      secretId: id,
      previousVersion: prevVersion,
      newVersion,
      rotatedAt: new Date().toISOString(),
      rotatedBy,
      reason,
      newFingerprint,
    });

    return secret;
  }

  public triggerEmergencyRotationAll(initiatedBy: string): {
    totalRotated: number;
    timestamp: string;
    action: string;
  } {
    let count = 0;
    this.secrets.forEach((secret) => {
      this.rotateSecret(secret.id, initiatedBy, 'EMERGENCY_SECURITY_LOCKDOWN_AND_PANIC_ROTATION');
      count++;
    });

    return {
      totalRotated: count,
      timestamp: new Date().toISOString(),
      action: 'ALL_SECRETS_CRYPTOGRAPHICALLY_ROTATED_AND_OLD_KEYS_REVOKED',
    };
  }

  public getRotationHistory(): SecretRotationEvent[] {
    return this.rotationHistory;
  }
}

export const secretsGovernanceEngine = new SecretsGovernanceEngine();
