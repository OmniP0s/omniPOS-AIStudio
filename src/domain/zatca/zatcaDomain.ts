// Enterprise ZATCA Phase 2 E-Invoicing Domain Model & Specifications
// Compliant with ZATCA E-Invoicing Technical Specifications (Fatoora Phase 2)
// Strictly typed with ISO codes, UBL 2.1 schemas, and Money value objects

import { Money } from '../financial/money';

export type ZatcaInvoiceType = '0100000' | '0200000'; // 0100000 = Standard (B2B), 0200000 = Simplified (B2C)
export type ZatcaTransactionType = '388' | '381' | '383' | '386'; // 388 = Tax Invoice, 381 = Credit Note, 383 = Debit Note, 386 = Prepayment
export type ZatcaTaxCategory = 'S' | 'Z' | 'E' | 'O'; // S = Standard (15%), Z = Zero Rated, E = Exempt, O = Out of Scope
export type ZatcaEnvironment = 'LOCAL_SIMULATION' | 'ZATCA_SANDBOX' | 'ZATCA_PRODUCTION';
export type ZatcaStatus = 'PENDING' | 'REPORTED' | 'CLEARED' | 'REJECTED' | 'NOT_APPLICABLE';

export interface ZatcaAddress {
  street: string;
  buildingNumber: string;
  additionalNumber?: string;
  district: string;
  city: string;
  postalCode: string;
  countryCode: string; // 'SA'
}

export interface ZatcaParty {
  legalName: string;
  vatNumber: string; // 15 digits starting and ending with 3
  crNumber?: string; // 10 digits
  address: ZatcaAddress;
  partyIdScheme?: string; // 'CRN', 'NAT', 'MOM', 'TIN'
  partyId?: string;
}

export interface ZatcaLineItem {
  id: string;
  name: string;
  nameAr?: string;
  quantity: number;
  unitCode: string; // 'PCE', 'KGM', 'LTR', etc.
  unitPrice: Money;
  discountAmount: Money;
  taxableAmount: Money;
  taxCategory: ZatcaTaxCategory;
  vatRate: number; // e.g. 0.15 for 15%
  vatAmount: Money;
  totalWithVat: Money;
}

export interface ZatcaDocumentReference {
  invoiceCounterValue: number; // Monotonically increasing ICV
  previousInvoiceHash: string; // SHA-256 Base64 of previous invoice
  billingReference?: {
    originalInvoiceId: string;
    originalInvoiceUuid: string;
    originalInvoiceIssueDate: string;
    reason?: string;
  };
}

export interface ZatcaInvoiceSummary {
  subtotal: Money; // Total net amount before tax and discount
  totalDiscount: Money;
  taxExclusiveAmount: Money; // Subtotal - totalDiscount
  totalVatAmount: Money;
  taxInclusiveAmount: Money; // TaxExclusiveAmount + totalVatAmount
  prepaidAmount: Money;
  payableAmount: Money; // TaxInclusiveAmount - prepaidAmount
}

export interface ZatcaInvoiceModel {
  uuid: string; // UUID v4
  invoiceNumber: string; // Human-readable / Sequential e.g. INV-2026-0001
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm:ss
  invoiceType: ZatcaInvoiceType; // '0100000' | '0200000'
  transactionType: ZatcaTransactionType; // '388' | '381' | '383'
  currency: string; // 'SAR'
  seller: ZatcaParty;
  buyer?: ZatcaParty;
  docReference: ZatcaDocumentReference;
  items: ZatcaLineItem[];
  summary: ZatcaInvoiceSummary;
  paymentMeansCode?: string; // '10' (Cash), '42' (Bank/Card), '48' (Card), 'ZZZ' (Other)
  notes?: string[];
}

export interface ZatcaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  ruleViolations: { ruleCode: string; message: string; severity: 'ERROR' | 'WARNING' }[];
}

export interface ZatcaSigningResult {
  rawXml: string;
  canonicalXml: string;
  invoiceHashBase64: string;
  digitalSignatureBase64: string;
  publicKeyBase64: string;
  x509CertificatePem: string;
  signedXml: string;
  qrCodeBase64: string;
}

export interface ZatcaApiResponse {
  environment: ZatcaEnvironment;
  invoiceUuid: string;
  status: ZatcaStatus;
  clearanceStatus?: 'CLEARED' | 'NOT_CLEARED';
  reportingStatus?: 'REPORTED' | 'NOT_REPORTED';
  cryptographicStamp?: string;
  validationResults: {
    status: 'PASS' | 'WARNING' | 'ERROR';
    infoMessages: string[];
    warningMessages: string[];
    errorMessages: string[];
  };
  submittedAt: string;
  rawResponse?: any;
}
