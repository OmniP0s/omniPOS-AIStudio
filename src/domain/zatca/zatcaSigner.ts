// Enterprise ZATCA Phase 2 Cryptographic Signing Engine
// Implements ECDSA secp256k1 signing, SHA-256 XML Canonicalization hashing,
// XAdES digital signature envelope injection, and 9-Tag TLV Base64 QR code generation

import * as crypto from 'crypto';
import { ZatcaInvoiceModel, ZatcaSigningResult } from './zatcaDomain';
import { Ubl21Generator } from './ublGenerator';
import { XmlCanonicalizer } from './xmlCanonicalizer';
import { encodeZatcaTLV, ZatcaTLVTag } from './zatcaEngine';
import { Money } from '../financial/money';

export class ZatcaSigner {
  private privateKeyPem: string;
  private publicKeyPem: string;
  private x509CertificatePem: string;

  constructor(credentials?: { privateKeyPem: string; publicKeyPem: string; x509CertificatePem: string }) {
    if (credentials) {
      this.privateKeyPem = credentials.privateKeyPem;
      this.publicKeyPem = credentials.publicKeyPem;
      this.x509CertificatePem = credentials.x509CertificatePem;
    } else {
      // Generate default ECDSA secp256k1 keys for local simulation / test environments
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      this.privateKeyPem = privateKey;
      this.publicKeyPem = publicKey;
      this.x509CertificatePem = `-----BEGIN CERTIFICATE-----\n${Buffer.from('ZATCA_PHASE2_SIMULATED_X509_CERTIFICATE').toString('base64')}\n-----END CERTIFICATE-----`;
    }
  }

  /**
   * Signs a ZATCA invoice model and produces canonical digest, ECDSA signature, and signed XML
   */
  public signInvoice(invoice: ZatcaInvoiceModel): ZatcaSigningResult {
    // 1. Generate Raw UBL 2.1 XML
    const rawXml = Ubl21Generator.generateXml(invoice);

    // 2. Canonicalize XML for Hashing (strips UBLExtensions and signature blocks)
    const canonicalXml = XmlCanonicalizer.canonicalizeForZatca(rawXml);

    // 3. Compute SHA-256 Hash of Canonical XML
    const hash = crypto.createHash('sha256');
    hash.update(canonicalXml, 'utf8');
    const invoiceHashBase64 = hash.digest('base64');

    // 4. Sign SHA-256 Digest using ECDSA secp256k1 Private Key
    const sign = crypto.createSign('SHA256');
    sign.update(canonicalXml, 'utf8');
    sign.end();
    const digitalSignatureBase64 = sign.sign(this.privateKeyPem, 'base64');

    // 5. Clean Public Key to Base64 (remove headers/newlines)
    const publicKeyBase64 = this.publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\r?\n|\r/g, '');

    // 6. Generate 9-Tag TLV Base64 QR Code
    const qrTimestamp = `${invoice.issueDate}T${invoice.issueTime}Z`;
    const tlvTags: ZatcaTLVTag[] = [
      { tag: 1, value: invoice.seller.legalName },
      { tag: 2, value: invoice.seller.vatNumber },
      { tag: 3, value: qrTimestamp },
      { tag: 4, value: invoice.summary.payableAmount.formatMajor() },
      { tag: 5, value: invoice.summary.totalVatAmount.formatMajor() },
      { tag: 6, value: invoiceHashBase64 },
      { tag: 7, value: digitalSignatureBase64 },
      { tag: 8, value: publicKeyBase64 },
      { tag: 9, value: 'ZATCA_SIMULATED_ECDSA_STAMP' },
    ];
    const qrCodeBase64 = encodeZatcaTLV(tlvTags);

    // 7. Inject Signed Envelope into UBL Extensions
    const signedXml = this.injectSignatureEnvelope(rawXml, {
      invoiceHashBase64,
      digitalSignatureBase64,
      x509CertificatePem: this.x509CertificatePem,
      qrCodeBase64,
    });

    return {
      rawXml,
      canonicalXml,
      invoiceHashBase64,
      digitalSignatureBase64,
      publicKeyBase64,
      x509CertificatePem: this.x509CertificatePem,
      signedXml,
      qrCodeBase64,
    };
  }

  /**
   * Embeds XAdES Digital Signature and QR code references into the UBL XML document
   */
  private injectSignatureEnvelope(xml: string, params: {
    invoiceHashBase64: string;
    digitalSignatureBase64: string;
    x509CertificatePem: string;
    qrCodeBase64: string;
  }): string {
    const signatureEnvelope = `
    <ext:UBLExtensions>
        <ext:UBLExtension>
            <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
            <ext:ExtensionContent>
                <sig:UBLDocumentSignatures xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2"
                                           xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2"
                                           xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2">
                    <sac:SignatureInformation>
                        <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
                        <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
                        <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="signature">
                            <ds:SignedInfo>
                                <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                                <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
                                <ds:Reference Id="invoiceSignedData" URI="">
                                    <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                    <ds:DigestValue>${params.invoiceHashBase64}</ds:DigestValue>
                                </ds:Reference>
                            </ds:SignedInfo>
                            <ds:SignatureValue>${params.digitalSignatureBase64}</ds:SignatureValue>
                            <ds:KeyInfo>
                                <ds:X509Data>
                                    <ds:X509Certificate>${Buffer.from(params.x509CertificatePem).toString('base64')}</ds:X509Certificate>
                                </ds:X509Data>
                            </ds:KeyInfo>
                        </ds:Signature>
                    </sac:SignatureInformation>
                </sig:UBLDocumentSignatures>
            </ext:ExtensionContent>
        </ext:UBLExtension>
    </ext:UBLExtensions>`;

    // Replace the extension placeholder
    let result = xml.replace(/<ext:UBLExtensions>[\s\S]*?<\/ext:UBLExtensions>/i, signatureEnvelope.trim());

    // Inject QR AdditionalDocumentReference right after PIH if missing
    if (!result.includes('<cbc:ID>QR</cbc:ID>')) {
      const qrDocRef = `
    <cac:AdditionalDocumentReference>
        <cbc:ID>QR</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${params.qrCodeBase64}</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>`;
      result = result.replace(/(<cac:AdditionalDocumentReference>\s*<cbc:ID>PIH<\/cbc:ID>[\s\S]*?<\/cac:AdditionalDocumentReference>)/i, `$1${qrDocRef}`);
    }

    return result;
  }

  /**
   * Verifies an invoice hash and signature against the public key
   */
  public verifyInvoiceSignature(canonicalXml: string, signatureBase64: string, publicKeyPem: string = this.publicKeyPem): boolean {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(canonicalXml, 'utf8');
      verify.end();
      return verify.verify(publicKeyPem, signatureBase64, 'base64');
    } catch {
      return false;
    }
  }
}
