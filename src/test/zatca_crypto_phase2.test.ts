import { describe, it, expect } from 'vitest';
import { ZatcaCryptoSigner, InMemoryCSIDVault } from '../domain/zatca/cryptoSigner';
import { Money } from '../domain/financial/money';
import { decodeZatcaTLV } from '../domain/zatca/zatcaEngine';

describe('ZATCA Phase 2 Cryptographic Signer & CSID Vault', () => {
  const signer = new ZatcaCryptoSigner();

  it('generates compliant ECDSA secp256k1 key pairs', async () => {
    const keyPair = await signer.generateKeyPair('EGS-TEST-001');
    expect(keyPair).toBeDefined();
    expect(keyPair.algorithm).toBe('ECDSA_SECP256K1');
    expect(keyPair.publicKeyPem).toContain('BEGIN PUBLIC KEY');
    expect(keyPair.privateKeyReference).toContain('BEGIN PRIVATE KEY');
  });

  it('computes deterministic SHA-256 hash in Base64', async () => {
    const sampleXml = '<Invoice><ID>INV-1001</ID></Invoice>';
    const hash1 = await signer.computeSha256Hash(sampleXml);
    const hash2 = await signer.computeSha256Hash(sampleXml);
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('cryptographically signs invoice hash with ECDSA and verifies signature', async () => {
    const keyPair = await signer.generateKeyPair('EGS-POS-01');
    const invoiceXml = '<Invoice><UUID>7f941ba2-6b94-4d89-98aa-51613149a4ff</UUID></Invoice>';
    
    const signature = await signer.signSha256(invoiceXml, keyPair.privateKeyReference);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);

    const isValid = await signer.verifySha256(invoiceXml, signature, keyPair.publicKeyPem);
    expect(isValid).toBe(true);

    const isTamperedValid = await signer.verifySha256(invoiceXml + ' ', signature, keyPair.publicKeyPem);
    expect(isTamperedValid).toBe(false);
  });

  it('generates ZATCA Phase 2 9-Tag TLV QR code with exact Money precision', () => {
    const total = Money.fromMajor('115.00', 'SAR');
    const tax = Money.fromMajor('15.00', 'SAR');

    const qrBase64 = ZatcaCryptoSigner.generatePhase2QRCode({
      sellerName: 'Omni Gourmet Ltd.',
      vatNumber: '310123456700003',
      invoiceTimestamp: '2026-08-29T19:40:00Z',
      invoiceTotal: total,
      vatTotal: tax,
      invoiceHashBase64: 'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0Nj==',
      digitalSignatureBase64: 'MEQCID44w...SIGNATURE...',
      publicKeyBase64: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
      cryptographicStampBase64: 'STAMP_HASH_VALUE',
    });

    expect(qrBase64).toBeDefined();
    const decoded = decodeZatcaTLV(qrBase64);
    expect(decoded.length).toBe(9);
    expect(decoded.find(t => t.tag === 1)?.value).toBe('Omni Gourmet Ltd.');
    expect(decoded.find(t => t.tag === 2)?.value).toBe('310123456700003');
    expect(decoded.find(t => t.tag === 4)?.value).toBe('115.00');
    expect(decoded.find(t => t.tag === 5)?.value).toBe('15.00');
  });

  it('stores and retrieves CSID certificates securely in the CSID Vault', async () => {
    const vault = new InMemoryCSIDVault();
    await vault.storeCSIDCertificate('TENANT-01', 'BR-01', 'EGS-01', '-----BEGIN CERTIFICATE-----\nMIIB...');
    await vault.storeCSIDSecret('TENANT-01', 'BR-01', 'secret-key-12345');

    const cert = await vault.getCSIDCertificate('TENANT-01', 'BR-01', 'EGS-01');
    const secret = await vault.getCSIDSecret('TENANT-01', 'BR-01');

    expect(cert).toContain('BEGIN CERTIFICATE');
    expect(secret).toBe('secret-key-12345');

    const missing = await vault.getCSIDCertificate('TENANT-02', 'BR-01', 'EGS-01');
    expect(missing).toBeNull();
  });
});
