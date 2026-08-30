// Enterprise Immutable Money Value Object
// Prevents currency mismatch, fractional halala loss, and IEEE floating point defects

import { Decimal, RoundingMode } from './decimal';

export type CurrencyCode = 'SAR' | 'USD' | 'AED' | 'KWD' | 'BHD' | 'OMR' | 'EUR' | 'GBP';

export interface CurrencyMeta {
  code: CurrencyCode;
  nameEn: string;
  nameAr: string;
  symbol: string;
  symbolAr: string;
  minorUnits: number; // 2 for SAR/USD, 3 for KWD/BHD/OMR, 0 for JPY
}

export const CURRENCY_REGISTRY: Record<CurrencyCode, CurrencyMeta> = {
  SAR: { code: 'SAR', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'SAR', symbolAr: 'ر.س', minorUnits: 2 },
  AED: { code: 'AED', nameEn: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'AED', symbolAr: 'د.إ', minorUnits: 2 },
  USD: { code: 'USD', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', symbolAr: '$', minorUnits: 2 },
  EUR: { code: 'EUR', nameEn: 'Euro', nameAr: 'يورو', symbol: '€', symbolAr: '€', minorUnits: 2 },
  GBP: { code: 'GBP', nameEn: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£', symbolAr: '£', minorUnits: 2 },
  KWD: { code: 'KWD', nameEn: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'KWD', symbolAr: 'د.ك', minorUnits: 3 },
  BHD: { code: 'BHD', nameEn: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'BHD', symbolAr: 'د.ب', minorUnits: 3 },
  OMR: { code: 'OMR', nameEn: 'Omani Rial', nameAr: 'ريال عماني', symbol: 'OMR', symbolAr: 'ر.ع', minorUnits: 3 },
};

export class Money {
  public readonly minorUnits: bigint;
  public readonly currency: CurrencyCode;
  private readonly meta: CurrencyMeta;

  constructor(minorUnits: bigint | number, currency: CurrencyCode = 'SAR') {
    this.currency = currency;
    this.meta = CURRENCY_REGISTRY[currency] || CURRENCY_REGISTRY.SAR;
    this.minorUnits = typeof minorUnits === 'bigint' ? minorUnits : BigInt(Math.round(minorUnits));
  }

  public static fromMajor(amount: number | string | Decimal, currency: CurrencyCode = 'SAR'): Money {
    const meta = CURRENCY_REGISTRY[currency] || CURRENCY_REGISTRY.SAR;
    const dec = amount instanceof Decimal ? amount : new Decimal(amount, 8);
    const minor = dec.toMinorUnits(meta.minorUnits, 'HALF_UP');
    return new Money(minor, currency);
  }

  public static fromMinor(minorUnits: bigint | number, currency: CurrencyCode = 'SAR'): Money {
    return new Money(minorUnits, currency);
  }

  public static zero(currency: CurrencyCode = 'SAR'): Money {
    return new Money(0n, currency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch in operation: cannot combine ${this.currency} with ${other.currency}`);
    }
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits + other.minorUnits, this.currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits - other.minorUnits, this.currency);
  }

  public multiply(factor: number | string | Decimal, rounding: RoundingMode = 'HALF_UP'): Money {
    const decFactor = factor instanceof Decimal ? factor : new Decimal(factor);
    const currentMinorDec = new Decimal(this.minorUnits.toString());
    const resultMinor = currentMinorDec.mul(decFactor).round(0, rounding);
    return new Money(BigInt(resultMinor.toFixed(0)), this.currency);
  }

  public divide(divisor: number | string | Decimal, rounding: RoundingMode = 'HALF_UP'): Money {
    const decDivisor = divisor instanceof Decimal ? divisor : new Decimal(divisor);
    if (decDivisor.isZero()) {
      throw new RangeError('Cannot divide Money by zero');
    }
    const currentMinorDec = new Decimal(this.minorUnits.toString());
    const resultMinor = currentMinorDec.div(decDivisor, 4).round(0, rounding);
    return new Money(BigInt(resultMinor.toFixed(0)), this.currency);
  }

  /**
   * Fair Split / Pro-rata Allocation (Penny-Safe)
   * Allocates this Money amount across N parts or weights without losing any minor units.
   * e.g., 100 SAR split 3 ways -> [33.34, 33.33, 33.33]
   */
  public allocate(ratios: (number | bigint)[]): Money[] {
    if (ratios.length === 0) return [];
    const bigintRatios = ratios.map(r => typeof r === 'bigint' ? r : BigInt(Math.round(r)));
    const totalWeight: bigint = bigintRatios.reduce((sum: bigint, r: bigint) => sum + r, 0n);
    if (totalWeight === 0n) {
      throw new Error('Total allocation weight must be greater than zero');
    }

    let remainder = this.minorUnits;
    const results: Money[] = [];

    for (const ratio of bigintRatios) {
      const share = (this.minorUnits * ratio) / totalWeight;
      results.push(new Money(share, this.currency));
      remainder -= share;
    }

    // Distribute remainder penny by penny to the first N buckets
    for (let i = 0; remainder > 0n && i < results.length; i++) {
      results[i] = new Money(results[i].minorUnits + 1n, this.currency);
      remainder -= 1n;
    }

    return results;
  }

  /**
   * Calculates VAT/Tax from an inclusive or exclusive price
   * ZATCA Phase 2 standard: 15% VAT (rate = 0.15)
   */
  public calculateTax(taxRate: number | Decimal = 0.15, isTaxInclusive: boolean = true): {
    taxableBasis: Money;
    taxAmount: Money;
    grossTotal: Money;
  } {
    const rateDec = taxRate instanceof Decimal ? taxRate : new Decimal(taxRate);
    
    if (isTaxInclusive) {
      // Gross = Basis * (1 + rate) -> Basis = Gross / (1 + rate)
      const divisor = rateDec.add(1);
      const basisDec = new Decimal(this.minorUnits.toString()).div(divisor, 6);
      const roundedBasisMinor = BigInt(basisDec.round(0, 'HALF_UP').toFixed(0));
      const taxableBasis = new Money(roundedBasisMinor, this.currency);
      const taxAmount = this.subtract(taxableBasis);
      return {
        taxableBasis,
        taxAmount,
        grossTotal: this,
      };
    } else {
      // Exclusive
      const taxAmount = this.multiply(rateDec, 'HALF_UP');
      const grossTotal = this.add(taxAmount);
      return {
        taxableBasis: this,
        taxAmount,
        grossTotal,
      };
    }
  }

  public toMajor(): number {
    const factor = 10 ** this.meta.minorUnits;
    return Number(this.minorUnits) / factor;
  }

  public toNumber(): number {
    return this.toMajor();
  }

  public formatMajor(decimals?: number): string {
    const precision = decimals !== undefined ? decimals : this.meta.minorUnits;
    return this.toDecimal().toFixed(precision);
  }

  public toDecimal(): Decimal {
    const factor = 10 ** this.meta.minorUnits;
    return new Decimal(this.minorUnits.toString()).div(factor, this.meta.minorUnits);
  }

  public toFormattedString(locale: 'ar' | 'en' = 'en', showSymbol: boolean = true): string {
    const majorStr = this.toDecimal().toFixed(this.meta.minorUnits);
    const symbol = locale === 'ar' ? this.meta.symbolAr : this.meta.symbol;
    if (!showSymbol) return majorStr;
    return locale === 'ar' ? `${majorStr} ${symbol}` : `${symbol} ${majorStr}`;
  }

  public equals(other: Money): boolean {
    return this.currency === other.currency && this.minorUnits === other.minorUnits;
  }

  public greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.minorUnits > other.minorUnits;
  }

  public greaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.minorUnits >= other.minorUnits;
  }

  public lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.minorUnits < other.minorUnits;
  }

  public isZero(): boolean {
    return this.minorUnits === 0n;
  }

  public isPositive(): boolean {
    return this.minorUnits > 0n;
  }

  public isNegative(): boolean {
    return this.minorUnits < 0n;
  }
}
