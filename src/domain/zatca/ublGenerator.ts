// Enterprise ZATCA Phase 2 Canonical UBL 2.1 Generator
// Generates strict OASIS UBL 2.1 XML conforming to ZATCA Technical Specifications (Fatoora Phase 2)
// Supports Standard Tax Invoices (0100000), Simplified Invoices (0200000), Credit Notes (381), and Debit Notes (383)

import { ZatcaInvoiceModel, ZatcaLineItem } from './zatcaDomain';

export class Ubl21Generator {
  /**
   * Generates complete UBL 2.1 XML document for ZATCA Phase 2
   */
  public static generateXml(invoice: ZatcaInvoiceModel): string {
    const profileId = invoice.invoiceType === '0200000' ? 'reporting:1.0' : 'clearance:1.0';
    const currency = invoice.currency || 'SAR';

    // Build Billing Reference if this is a Credit Note (381) or Debit Note (383)
    let billingReferenceXml = '';
    if ((invoice.transactionType === '381' || invoice.transactionType === '383') && invoice.docReference.billingReference) {
      const ref = invoice.docReference.billingReference;
      billingReferenceXml = `
    <cac:BillingReference>
        <cac:InvoiceDocumentReference>
            <cbc:ID>${this.escapeXml(ref.originalInvoiceId)}</cbc:ID>
            <cbc:UUID>${this.escapeXml(ref.originalInvoiceUuid)}</cbc:UUID>
            <cbc:IssueDate>${ref.originalInvoiceIssueDate}</cbc:IssueDate>
        </cac:InvoiceDocumentReference>
    </cac:BillingReference>`;
    }

    // Build Buyer XML for Standard B2B (or optional B2C)
    let buyerXml = '';
    if (invoice.buyer) {
      const b = invoice.buyer;
      const bPartyId = b.crNumber ? `<cac:PartyIdentification><cbc:ID schemeID="CRN">${this.escapeXml(b.crNumber)}</cbc:ID></cac:PartyIdentification>` : '';
      buyerXml = `
    <cac:AccountingCustomerParty>
        <cac:Party>
            ${bPartyId}
            <cac:PostalAddress>
                <cbc:StreetName>${this.escapeXml(b.address.street)}</cbc:StreetName>
                <cbc:BuildingNumber>${this.escapeXml(b.address.buildingNumber)}</cbc:BuildingNumber>
                ${b.address.additionalNumber ? `<cbc:PlotIdentification>${this.escapeXml(b.address.additionalNumber)}</cbc:PlotIdentification>` : ''}
                <cbc:CitySubdivisionName>${this.escapeXml(b.address.district)}</cbc:CitySubdivisionName>
                <cbc:CityName>${this.escapeXml(b.address.city)}</cbc:CityName>
                <cbc:PostalZone>${this.escapeXml(b.address.postalCode)}</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>${b.address.countryCode || 'SA'}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${this.escapeXml(b.vatNumber || 'NA')}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${this.escapeXml(b.legalName)}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>`;
    }

    // Build Line Items XML
    const lineItemsXml = invoice.items.map((item, idx) => this.generateLineItemXml(item, idx + 1, currency)).join('\n');

    // Build Tax Subtotals by Tax Category
    const taxSubtotalXml = `
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="${currency}">${invoice.summary.taxExclusiveAmount.formatMajor()}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="${currency}">${invoice.summary.totalVatAmount.formatMajor()}</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>15.00</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>`;

    // Assemble complete UBL 2.1 XML
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
    <ext:UBLExtensions>
        <ext:UBLExtension>
            <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
            <ext:ExtensionContent>
                <!-- ZATCA Phase 2 Digital Signature Envelope Placeholder -->
            </ext:ExtensionContent>
        </ext:UBLExtension>
    </ext:UBLExtensions>
    <cbc:ProfileID>${profileId}</cbc:ProfileID>
    <cbc:ID>${this.escapeXml(invoice.invoiceNumber)}</cbc:ID>
    <cbc:UUID>${invoice.uuid}</cbc:UUID>
    <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
    <cbc:IssueTime>${invoice.issueTime}</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="${invoice.invoiceType}">${invoice.transactionType}</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
    <cbc:TaxCurrencyCode>${currency}</cbc:TaxCurrencyCode>${billingReferenceXml}
    <cac:AdditionalDocumentReference>
        <cbc:ID>ICV</cbc:ID>
        <cbc:UUID>${invoice.docReference.invoiceCounterValue}</cbc:UUID>
    </cac:AdditionalDocumentReference>
    <cac:AdditionalDocumentReference>
        <cbc:ID>PIH</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${invoice.docReference.previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="CRN">${this.escapeXml(invoice.seller.crNumber || '1010000000')}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PostalAddress>
                <cbc:StreetName>${this.escapeXml(invoice.seller.address.street)}</cbc:StreetName>
                <cbc:BuildingNumber>${this.escapeXml(invoice.seller.address.buildingNumber)}</cbc:BuildingNumber>
                ${invoice.seller.address.additionalNumber ? `<cbc:PlotIdentification>${this.escapeXml(invoice.seller.address.additionalNumber)}</cbc:PlotIdentification>` : ''}
                <cbc:CitySubdivisionName>${this.escapeXml(invoice.seller.address.district)}</cbc:CitySubdivisionName>
                <cbc:CityName>${this.escapeXml(invoice.seller.address.city)}</cbc:CityName>
                <cbc:PostalZone>${this.escapeXml(invoice.seller.address.postalCode)}</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>${invoice.seller.address.countryCode || 'SA'}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${this.escapeXml(invoice.seller.vatNumber)}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${this.escapeXml(invoice.seller.legalName)}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>${buyerXml}
    <cac:Delivery>
        <cbc:ActualDeliveryDate>${invoice.issueDate}</cbc:ActualDeliveryDate>
    </cac:Delivery>
    <cac:PaymentMeans>
        <cbc:PaymentMeansCode>${invoice.paymentMeansCode || '10'}</cbc:PaymentMeansCode>
    </cac:PaymentMeans>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${invoice.summary.totalVatAmount.formatMajor()}</cbc:TaxAmount>${taxSubtotalXml}
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="${currency}">${invoice.summary.subtotal.formatMajor()}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="${currency}">${invoice.summary.taxExclusiveAmount.formatMajor()}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="${currency}">${invoice.summary.taxInclusiveAmount.formatMajor()}</cbc:TaxInclusiveAmount>
        <cbc:AllowanceTotalAmount currencyID="${currency}">${invoice.summary.totalDiscount.formatMajor()}</cbc:AllowanceTotalAmount>
        <cbc:PrepaidAmount currencyID="${currency}">${invoice.summary.prepaidAmount.formatMajor()}</cbc:PrepaidAmount>
        <cbc:PayableAmount currencyID="${currency}">${invoice.summary.payableAmount.formatMajor()}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
${lineItemsXml}
</Invoice>`;
  }

  private static generateLineItemXml(item: ZatcaLineItem, lineNumber: number, currency: string): string {
    const allowanceXml = !item.discountAmount.isZero() ? `
        <cac:AllowanceCharge>
            <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
            <cbc:AllowanceChargeReason>Discount</cbc:AllowanceChargeReason>
            <cbc:Amount currencyID="${currency}">${item.discountAmount.formatMajor()}</cbc:Amount>
        </cac:AllowanceCharge>` : '';

    return `    <cac:InvoiceLine>
        <cbc:ID>${lineNumber}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="${item.unitCode || 'PCE'}">${item.quantity.toFixed(2)}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="${currency}">${item.taxableAmount.formatMajor()}</cbc:LineExtensionAmount>${allowanceXml}
        <cac:TaxTotal>
            <cbc:TaxAmount currencyID="${currency}">${item.vatAmount.formatMajor()}</cbc:TaxAmount>
            <cbc:RoundingAmount currencyID="${currency}">${item.totalWithVat.formatMajor()}</cbc:RoundingAmount>
        </cac:TaxTotal>
        <cac:Item>
            <cbc:Name>${this.escapeXml(item.name)}</cbc:Name>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>${item.taxCategory || 'S'}</cbc:ID>
                <cbc:Percent>${(item.vatRate * 100).toFixed(2)}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="${currency}">${item.unitPrice.formatMajor()}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>`;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
