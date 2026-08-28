import { CountryCompliancePackage, FxExchangeRate, SupportedCurrency, SupportedLanguage } from './types';

export const COUNTRY_COMPLIANCE_PACKAGES: CountryCompliancePackage[] = [
  {
    countryCode: 'SA',
    countryNameEn: 'Kingdom of Saudi Arabia',
    countryNameAr: 'المملكة العربية السعودية',
    flagEmoji: '🇸🇦',
    currency: 'SAR',
    defaultVatRatePercent: 15.0,
    vatTaxAuthority: 'ZATCA (Zakat, Tax and Customs Authority)',
    eInvoiceStandard: 'ZATCA Fatoora Phase 2 (UBL 2.1 Cryptographic Stamp + QR Tag 1-9)',
    calendarSystem: 'HIJRI_GREGORIAN_DUAL',
    workingWeekDays: 'Sunday - Thursday (Friday / Saturday Weekend)',
    phoneFormatRegex: '^(\\+966|0)?5[0-9]{8}$',
    fiscalYearStart: '01-01',
    wpsPayrollRequired: true,
    legalEntityRequirements: [
      'Commercial Registration (CR) from Ministry of Commerce',
      '15-digit ZATCA Tax Identification Number (TIN)',
      'National Address (Wasel 4-digit building, postal code, additional number)',
      'GOSI Establishment Code',
      'Mudad Wages Protection System (WPS) Compliance',
    ],
  },
  {
    countryCode: 'AE',
    countryNameEn: 'United Arab Emirates',
    countryNameAr: 'الإمارات العربية المتحدة',
    flagEmoji: '🇦🇪',
    currency: 'AED',
    defaultVatRatePercent: 5.0,
    vatTaxAuthority: 'FTA (Federal Tax Authority)',
    eInvoiceStandard: 'FTA E-Billing System (Peppol Network Standard)',
    calendarSystem: 'GREGORIAN',
    workingWeekDays: 'Monday - Friday (Saturday / Sunday Weekend)',
    phoneFormatRegex: '^(\\+971|0)?5[0-9]{8}$',
    fiscalYearStart: '01-01',
    wpsPayrollRequired: true,
    legalEntityRequirements: [
      'Department of Economy & Tourism (DET) Trade License',
      'FTA Tax Registration Number (TRN 15 digits)',
      'Corporate Tax Registration (9% standard rate)',
      'MOHRE WPS Direct Salary Transfer',
    ],
  },
  {
    countryCode: 'QA',
    countryNameEn: 'State of Qatar',
    countryNameAr: 'دولة قطر',
    flagEmoji: '🇶🇦',
    currency: 'QAR',
    defaultVatRatePercent: 0.0,
    vatTaxAuthority: 'General Tax Authority (GTA)',
    eInvoiceStandard: 'Dhareeba Digital Tax Portal',
    calendarSystem: 'HIJRI_GREGORIAN_DUAL',
    workingWeekDays: 'Sunday - Thursday',
    phoneFormatRegex: '^(\\+974)?[3567][0-9]{7}$',
    fiscalYearStart: '01-01',
    wpsPayrollRequired: true,
    legalEntityRequirements: [
      'Ministry of Commerce and Industry (MOCI) Commercial Registration',
      'Municipality Trade License',
      'Qatar Central Bank WPS Registration',
    ],
  },
  {
    countryCode: 'KW',
    countryNameEn: 'State of Kuwait',
    countryNameAr: 'دولة الكويت',
    flagEmoji: '🇰🇼',
    currency: 'KWD',
    defaultVatRatePercent: 0.0,
    vatTaxAuthority: 'Ministry of Finance - Tax Administration',
    eInvoiceStandard: 'Kuwait Central Fiscal Registry',
    calendarSystem: 'HIJRI_GREGORIAN_DUAL',
    workingWeekDays: 'Sunday - Thursday',
    phoneFormatRegex: '^(\\+965)?[569][0-9]{7}$',
    fiscalYearStart: '04-01',
    wpsPayrollRequired: true,
    legalEntityRequirements: [
      'Kuwait Chamber of Commerce & Industry (KCCI) License',
      'Public Authority for Civil Information (PACI) Registry',
      'Ministry of Social Affairs & Labor MOSAL Labor Quotas',
    ],
  },
  {
    countryCode: 'BH',
    countryNameEn: 'Kingdom of Bahrain',
    countryNameAr: 'مملكة البحرين',
    flagEmoji: '🇧🇭',
    currency: 'BHD',
    defaultVatRatePercent: 10.0,
    vatTaxAuthority: 'National Bureau for Revenue (NBR)',
    eInvoiceStandard: 'NBR E-Invoicing Mandate',
    calendarSystem: 'HIJRI_GREGORIAN_DUAL',
    workingWeekDays: 'Sunday - Thursday',
    phoneFormatRegex: '^(\\+973)?[36][0-9]{7}$',
    fiscalYearStart: '01-01',
    wpsPayrollRequired: true,
    legalEntityRequirements: [
      'Sijilat Commercial Registration (Ministry of Industry and Commerce)',
      'NBR 15-digit VAT Account ID',
      'LMRA Labor Market Regulatory Authority System',
    ],
  },
  {
    countryCode: 'OM',
    countryNameEn: 'Sultanate of Oman',
    countryNameAr: 'سلطنة عمان',
    flagEmoji: '🇴🇲',
    currency: 'OMR',
    defaultVatRatePercent: 5.0,
    vatTaxAuthority: 'Oman Tax Authority (OTA)',
    eInvoiceStandard: 'OTA B2B/B2C E-Invoicing Standard',
    calendarSystem: 'HIJRI_GREGORIAN_DUAL',
    workingWeekDays: 'Sunday - Thursday',
    phoneFormatRegex: '^(\\+968)?[79][0-9]{7}$',
    fiscalYearStart: '01-01',
    wpsPayrollRequired: true,
    legalEntityRequirements: [
      'Invest Easy Commercial Registration',
      'Oman Tax Authority VAT TIN',
      'Ministry of Labour Omanisation Quotas',
    ],
  },
  {
    countryCode: 'EG',
    countryNameEn: 'Arab Republic of Egypt',
    countryNameAr: 'جمهورية مصر العربية',
    flagEmoji: '🇪🇬',
    currency: 'EGP',
    defaultVatRatePercent: 14.0,
    vatTaxAuthority: 'Egyptian Tax Authority (ETA)',
    eInvoiceStandard: 'ETA E-Receipt (B2C) & E-Invoice (B2B) v1.0',
    calendarSystem: 'GREGORIAN',
    workingWeekDays: 'Sunday - Thursday',
    phoneFormatRegex: '^(\\+20|0)?1[0125][0-9]{8}$',
    fiscalYearStart: '07-01',
    wpsPayrollRequired: false,
    legalEntityRequirements: [
      'Tax Card (Betaka Darebeya) 9-digit registration',
      'Commercial Registry (Sejel Togary)',
      'Egypt E-Receipt POS Integration SDK with HSM Signing',
    ],
  },
];

export const LIVE_FX_RATES: FxExchangeRate[] = [
  { currency: 'SAR', symbol: 'ر.س', rateToSar: 1.0, inverseRate: 1.0, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'AED', symbol: 'د.إ', rateToSar: 1.021, inverseRate: 0.979, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'QAR', symbol: 'ر.ق', rateToSar: 1.030, inverseRate: 0.971, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'KWD', symbol: 'د.ك', rateToSar: 12.25, inverseRate: 0.0816, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'BHD', symbol: 'د.ب', rateToSar: 9.947, inverseRate: 0.1005, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'OMR', symbol: 'ر.ع', rateToSar: 9.753, inverseRate: 0.1025, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'EGP', symbol: 'ج.م', rateToSar: 0.077, inverseRate: 12.987, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'USD', symbol: '$', rateToSar: 3.750, inverseRate: 0.2667, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'EUR', symbol: '€', rateToSar: 4.120, inverseRate: 0.2427, lastUpdated: '2026-08-27 12:00 UTC' },
  { currency: 'GBP', symbol: '£', rateToSar: 4.890, inverseRate: 0.2045, lastUpdated: '2026-08-27 12:00 UTC' },
];

/**
 * Converts any supported currency to SAR or target currency
 */
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  if (fromCurrency === toCurrency) return amount;
  const fromFx = LIVE_FX_RATES.find(r => r.currency === fromCurrency);
  const toFx = LIVE_FX_RATES.find(r => r.currency === toCurrency);
  if (!fromFx || !toFx) return amount;

  const inSar = amount * fromFx.rateToSar;
  const targetAmount = inSar / toFx.rateToSar;
  return Math.round(targetAmount * 100) / 100;
}

/**
 * Formats a localized currency string
 */
export function formatLocalizedCurrency(
  amount: number,
  currency: SupportedCurrency,
  language: SupportedLanguage = 'ar'
): string {
  const fx = LIVE_FX_RATES.find(r => r.currency === currency);
  const symbol = fx ? fx.symbol : currency;
  const formattedNumber = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return language === 'ar' ? `${formattedNumber} ${symbol}` : `${symbol} ${formattedNumber}`;
}
