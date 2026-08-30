import { describe, it, expect } from 'vitest';
import { Decimal } from '../domain/financial/decimal';
import { Money } from '../domain/financial/money';

describe('Decimal Engine - Precision Arithmetic', () => {
  it('prevents standard IEEE 754 floating point errors (0.1 + 0.2 === 0.3)', () => {
    const a = new Decimal('0.1');
    const b = new Decimal('0.2');
    const sum = a.add(b);
    expect(sum.toString()).toBe('0.3');
    expect(sum.equals('0.3')).toBe(true);
  });

  it('handles exact multiplication and division', () => {
    const price = new Decimal('19.99');
    const qty = new Decimal('3');
    const total = price.mul(qty);
    expect(total.toFixed(2)).toBe('59.97');

    const divided = total.div(new Decimal('3'));
    expect(divided.toFixed(2)).toBe('19.99');
  });

  it('supports Banker\'s Rounding (HALF_EVEN) and ZATCA Standard (HALF_UP)', () => {
    // 2.5 rounded to nearest integer
    const val1 = new Decimal('2.5');
    expect(val1.toFixed(0, 'HALF_EVEN')).toBe('2'); // Round to even 2
    expect(val1.toFixed(0, 'HALF_UP')).toBe('3');   // Round up to 3

    // 3.5 rounded to nearest integer
    const val2 = new Decimal('3.5');
    expect(val2.toFixed(0, 'HALF_EVEN')).toBe('4'); // Round to even 4
    expect(val2.toFixed(0, 'HALF_UP')).toBe('4');   // Round up to 4
  });

  it('throws on division by zero', () => {
    const val = new Decimal('100');
    expect(() => val.div(new Decimal('0'))).toThrow(RangeError);
  });
});

describe('Money Value Object - Enterprise Financial Calculations', () => {
  it('creates Money instances from major and minor units', () => {
    const m1 = Money.fromMajor('15.50', 'SAR');
    expect(m1.minorUnits).toBe(1550n);
    expect(m1.toMajor()).toBe(15.5);
    expect(m1.toFormattedString('en')).toBe('SAR 15.50');
    expect(m1.toFormattedString('ar')).toBe('15.50 ر.س');
  });

  it('enforces strict currency safety across operations', () => {
    const sar = Money.fromMajor('100', 'SAR');
    const usd = Money.fromMajor('100', 'USD');
    expect(() => sar.add(usd)).toThrow(/Currency mismatch/);
    expect(() => sar.subtract(usd)).toThrow(/Currency mismatch/);
  });

  it('performs Penny-Safe Fair Split Allocation without halala loss', () => {
    // 100 SAR split 3 ways must total exactly 100.00 SAR (33.34 + 33.33 + 33.33)
    const hundred = Money.fromMajor('100.00', 'SAR');
    const parts = hundred.allocate([1, 1, 1]);

    expect(parts.length).toBe(3);
    expect(parts[0].toMajor()).toBe(33.34);
    expect(parts[1].toMajor()).toBe(33.33);
    expect(parts[2].toMajor()).toBe(33.33);

    const sum = parts.reduce((acc, p) => acc.add(p), Money.zero('SAR'));
    expect(sum.equals(hundred)).toBe(true);
  });

  it('calculates ZATCA Phase 2 standard 15% inclusive VAT with zero discrepancy', () => {
    // e.g. 115 SAR inclusive of 15% VAT -> 100 SAR basis, 15 SAR VAT
    const gross = Money.fromMajor('115.00', 'SAR');
    const taxInfo = gross.calculateTax(0.15, true);

    expect(taxInfo.taxableBasis.toMajor()).toBe(100.00);
    expect(taxInfo.taxAmount.toMajor()).toBe(15.00);
    expect(taxInfo.grossTotal.toMajor()).toBe(115.00);
    expect(taxInfo.taxableBasis.add(taxInfo.taxAmount).equals(gross)).toBe(true);
  });

  it('calculates ZATCA Phase 2 fractional prices inclusive VAT', () => {
    // e.g. 25.00 SAR item with 15% VAT inclusive
    // Basis = 25 / 1.15 = 21.7391... -> 21.74 SAR
    // Tax = 25.00 - 21.74 = 3.26 SAR
    const itemPrice = Money.fromMajor('25.00', 'SAR');
    const taxInfo = itemPrice.calculateTax(0.15, true);

    expect(taxInfo.taxableBasis.minorUnits).toBe(2174n);
    expect(taxInfo.taxAmount.minorUnits).toBe(326n);
    expect(taxInfo.taxableBasis.add(taxInfo.taxAmount).equals(itemPrice)).toBe(true);
  });

  it('calculates tax-exclusive pricing accurately', () => {
    const net = Money.fromMajor('100.00', 'SAR');
    const taxInfo = net.calculateTax(0.15, false);

    expect(taxInfo.taxableBasis.toMajor()).toBe(100.00);
    expect(taxInfo.taxAmount.toMajor()).toBe(15.00);
    expect(taxInfo.grossTotal.toMajor()).toBe(115.00);
  });

  it('supports 3-decimal currencies like KWD', () => {
    const kwd = Money.fromMajor('12.345', 'KWD');
    expect(kwd.minorUnits).toBe(12345n);
    expect(kwd.toMajor()).toBe(12.345);
    expect(kwd.toFormattedString('en')).toBe('KWD 12.345');
  });
});
