import { StorageObjectMetadata } from './types';

export interface PreSignedUrlResponse {
  url: string;
  expiresAt: string;
  httpMethod: 'GET' | 'PUT';
  headers: Record<string, string>;
  signatureSha256: string;
}

export interface LifecyclePolicyRule {
  id: string;
  bucket: string;
  prefix: string;
  transitionToColdDays: number;
  retentionLockYears: number;
  descriptionEn: string;
  descriptionAr: string;
}

export class EnterpriseStorageEngine {
  private objects: Map<string, StorageObjectMetadata> = new Map();
  private lifecycleRules: LifecyclePolicyRule[] = [];

  constructor() {
    this.seedDefaultStorage();
  }

  private seedDefaultStorage(): void {
    const sampleFiles: StorageObjectMetadata[] = [
      {
        id: 'OBJ-INV-2026-001',
        bucket: 'omnipos-zatca-invoices',
        key: 'invoices/2026/08/INV-2026-9901.xml',
        versionId: 'v1.0.3-signed',
        sizeBytes: 48200,
        contentType: 'application/xml',
        checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        encryptionAlgorithm: 'AES_256_GCM_ENVELOPE',
        virusScanStatus: 'CLEAN',
        replicationStatus: 'REPLICATED_3_REGIONS',
        lifecycleTier: 'ZATCA_COMPLIANT_VAULT_6YR',
        createdAt: '2026-08-27T08:00:00Z',
        isCurrentVersion: true,
      },
      {
        id: 'OBJ-MENU-BURGER-01',
        bucket: 'omnipos-public-assets',
        key: 'menu/items/truffle-burger-hero.webp',
        versionId: 'v2.1.0-opt',
        sizeBytes: 124500,
        contentType: 'image/webp',
        checksumSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        encryptionAlgorithm: 'KMS_MANAGED',
        virusScanStatus: 'CLEAN',
        replicationStatus: 'REPLICATED_3_REGIONS',
        lifecycleTier: 'HOT',
        createdAt: '2026-08-20T12:00:00Z',
        isCurrentVersion: true,
      },
      {
        id: 'OBJ-RECEIPT-LOG-01',
        bucket: 'omnipos-audit-archives',
        key: 'audit/pos-shifts/2026-07-shift-summary.pdf',
        versionId: 'v1.0.0',
        sizeBytes: 845000,
        contentType: 'application/pdf',
        checksumSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        encryptionAlgorithm: 'AES_256_GCM_ENVELOPE',
        virusScanStatus: 'CLEAN',
        replicationStatus: 'REPLICATED_3_REGIONS',
        lifecycleTier: 'COOL_ARCHIVE',
        createdAt: '2026-07-31T23:59:59Z',
        isCurrentVersion: true,
      },
    ];

    sampleFiles.forEach(f => this.objects.set(f.id, f));

    this.lifecycleRules = [
      {
        id: 'LIFECYCLE-ZATCA-6YR',
        bucket: 'omnipos-zatca-invoices',
        prefix: 'invoices/',
        transitionToColdDays: 365,
        retentionLockYears: 6,
        descriptionEn: 'Mandatory 6-Year Immutable Cryptographic Retention for Saudi Tax Authority Audits.',
        descriptionAr: 'حفظ غير قابل للتعديل أو الحذف لمدة 6 سنوات للامتثال الضريبي لهيئة الزكاة والضريبة.',
      },
      {
        id: 'LIFECYCLE-AUDIT-LOGS',
        bucket: 'omnipos-audit-archives',
        prefix: 'audit/',
        transitionToColdDays: 90,
        retentionLockYears: 3,
        descriptionEn: 'Transition system audit logs to cold storage after 90 days, retain for 3 years.',
        descriptionAr: 'نقل سجلات التدقيق للتخزين البارد بعد 90 يوماً والاحتفاظ بها لثلاث سنوات.',
      },
    ];
  }

  public generatePreSignedUrl(params: {
    bucket: string;
    key: string;
    httpMethod: 'GET' | 'PUT';
    expirationMinutes: number;
    contentType?: string;
  }): PreSignedUrlResponse {
    const expDate = new Date();
    expDate.setMinutes(expDate.getMinutes() + params.expirationMinutes);

    const token = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const signature = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return {
      url: `https://storage.omnipos.sa/${params.bucket}/${params.key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${params.expirationMinutes * 60}&X-Amz-Security-Token=${token}&X-Amz-Signature=${signature}`,
      expiresAt: expDate.toISOString(),
      httpMethod: params.httpMethod,
      headers: {
        'Content-Type': params.contentType || 'application/octet-stream',
        'x-amz-server-side-encryption': 'aws:kms',
      },
      signatureSha256: signature,
    };
  }

  public uploadObject(file: {
    bucket: string;
    key: string;
    sizeBytes: number;
    contentType: string;
    contentBase64?: string;
  }): { success: boolean; object: StorageObjectMetadata; virusClean: boolean; optimized: boolean } {
    const isMalicious = file.key.includes('malware') || file.key.includes('virus');

    const id = `OBJ-${Date.now()}`;
    const checksum = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newObj: StorageObjectMetadata = {
      id,
      bucket: file.bucket,
      key: file.key,
      versionId: 'v1.0.0',
      sizeBytes: file.contentType.startsWith('image/') ? Math.round(file.sizeBytes * 0.45) : file.sizeBytes, // Simulated 55% optimization
      contentType: file.contentType.startsWith('image/') ? 'image/webp' : file.contentType,
      checksumSha256: checksum,
      encryptionAlgorithm: 'AES_256_GCM_ENVELOPE',
      virusScanStatus: isMalicious ? 'INFECTED' : 'CLEAN',
      replicationStatus: 'REPLICATED_3_REGIONS',
      lifecycleTier: file.bucket.includes('zatca') ? 'ZATCA_COMPLIANT_VAULT_6YR' : 'HOT',
      createdAt: new Date().toISOString(),
      isCurrentVersion: true,
    };

    if (!isMalicious) {
      this.objects.set(id, newObj);
    }

    return {
      success: !isMalicious,
      object: newObj,
      virusClean: !isMalicious,
      optimized: file.contentType.startsWith('image/'),
    };
  }

  public getObjects(): StorageObjectMetadata[] {
    return Array.from(this.objects.values());
  }

  public getLifecycleRules(): LifecyclePolicyRule[] {
    return this.lifecycleRules;
  }
}

export const enterpriseStorageEngine = new EnterpriseStorageEngine();
