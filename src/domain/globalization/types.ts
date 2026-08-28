export type SupportedCurrency = 'SAR' | 'AED' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'EGP' | 'USD' | 'EUR' | 'GBP';
export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'de' | 'es' | 'ur' | 'hi' | 'tl';

export interface CountryCompliancePackage {
  countryCode: string;
  countryNameEn: string;
  countryNameAr: string;
  flagEmoji: string;
  currency: SupportedCurrency;
  defaultVatRatePercent: number;
  vatTaxAuthority: string;
  eInvoiceStandard: string;
  calendarSystem: 'GREGORIAN' | 'HIJRI_GREGORIAN_DUAL' | 'GREGORIAN_ONLY';
  workingWeekDays: string;
  phoneFormatRegex: string;
  fiscalYearStart: string;
  wpsPayrollRequired: boolean;
  legalEntityRequirements: string[];
}

export interface FxExchangeRate {
  currency: SupportedCurrency;
  symbol: string;
  rateToSar: number;
  inverseRate: number;
  lastUpdated: string;
}
