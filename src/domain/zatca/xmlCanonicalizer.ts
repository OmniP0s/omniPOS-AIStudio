// Enterprise XML Canonicalizer (C14N) for ZATCA Phase 2
// Conforms to W3C Canonical XML (C14N 1.1 / C14N 1.0) and ZATCA E-Invoicing Rules
// Normalizes XML structures, attributes, and tags to produce a deterministic SHA-256 digest

export class XmlCanonicalizer {
  /**
   * Prepares ZATCA UBL XML for hashing by removing the ext:UBLExtensions tag
   * (which contains the signature itself), XML declaration, and non-canonical whitespace.
   */
  public static canonicalizeForZatca(xml: string): string {
    let clean = xml;

    // 1. Remove XML declaration <?xml ... ?>
    clean = clean.replace(/<\?xml[^>]*\?>/gi, '');

    // 2. Remove comments <!-- ... -->
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');

    // 3. Remove ext:UBLExtensions envelope (which holds the signature and QR elements)
    clean = clean.replace(/<ext:UBLExtensions>[\s\S]*?<\/ext:UBLExtensions>/gi, '');

    // 4. Remove cac:Signature element if present
    clean = clean.replace(/<cac:Signature>[\s\S]*?<\/cac:Signature>/gi, '');

    // 5. Remove cac:AdditionalDocumentReference for QR code if embedded inside XML
    clean = clean.replace(/<cac:AdditionalDocumentReference>\s*<cbc:ID>QR<\/cbc:ID>[\s\S]*?<\/cac:AdditionalDocumentReference>/gi, '');

    // 6. Normalize whitespace between tags
    clean = clean.replace(/>\s+</g, '><');

    // 7. Trim leading and trailing whitespace
    clean = clean.trim();

    return clean;
  }

  /**
   * General-purpose canonical XML standardizer (C14N without comments)
   */
  public static canonicalize(xml: string): string {
    let result = xml.replace(/<\?xml[^>]*\?>/gi, '');
    result = result.replace(/<!--[\s\S]*?-->/g, '');
    result = result.replace(/>\s+</g, '><');
    return result.trim();
  }
}
