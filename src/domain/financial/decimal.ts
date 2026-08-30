// Enterprise Arbitrary-Precision Decimal Engine
// Prevents IEEE 754 floating-point drift in financial, tax, and inventory calculations

export type RoundingMode = 'HALF_UP' | 'HALF_EVEN' | 'HALF_DOWN' | 'UP' | 'DOWN' | 'CEIL' | 'FLOOR';

export class Decimal {
  private readonly units: bigint;
  private readonly scale: number;

  private static readonly DEFAULT_SCALE = 8;
  private static readonly POW10: bigint[] = [
    1n, 10n, 100n, 1000n, 10000n, 100000n, 1000000n, 10000000n, 100000000n,
    1000000000n, 10000000000n, 100000000000n, 1000000000000n, 10000000000000n, 100000000000000n, 1000000000000000n
  ];

  constructor(value: number | string | bigint | Decimal, scale: number = Decimal.DEFAULT_SCALE) {
    this.scale = scale;
    if (value instanceof Decimal) {
      this.units = Decimal.rescaleUnits(value.units, value.scale, scale);
    } else if (typeof value === 'bigint') {
      this.units = value * Decimal.getPow10(scale);
    } else if (typeof value === 'number') {
      this.units = Decimal.fromString(value.toString(), scale);
    } else if (typeof value === 'string') {
      this.units = Decimal.fromString(value.trim(), scale);
    } else {
      throw new TypeError(`Unsupported Decimal initial value: ${value}`);
    }
  }

  public static fromRaw(rawUnits: bigint, scale: number = Decimal.DEFAULT_SCALE): Decimal {
    const d = Object.create(Decimal.prototype) as Decimal;
    (d as any).units = rawUnits;
    (d as any).scale = scale;
    return d;
  }

  private static getPow10(exp: number): bigint {
    if (exp >= 0 && exp < Decimal.POW10.length) {
      return Decimal.POW10[exp];
    }
    return 10n ** BigInt(exp);
  }

  private static rescaleUnits(units: bigint, fromScale: number, toScale: number): bigint {
    if (fromScale === toScale) return units;
    if (toScale > fromScale) {
      return units * Decimal.getPow10(toScale - fromScale);
    }
    const diff = fromScale - toScale;
    const divisor = Decimal.getPow10(diff);
    return units / divisor;
  }

  private static fromString(str: string, targetScale: number): bigint {
    if (!str || str.trim() === '') return 0n;
    const isNeg = str.startsWith('-');
    const cleanStr = isNeg ? str.slice(1) : str.startsWith('+') ? str.slice(1) : str;

    const parts = cleanStr.split('.');
    const integerPart = parts[0] ? BigInt(parts[0]) : 0n;
    const fractionStr = (parts[1] || '').slice(0, targetScale);
    const paddedFractionStr = fractionStr.padEnd(targetScale, '0');
    const fractionPart = paddedFractionStr ? BigInt(paddedFractionStr) : 0n;

    const total = integerPart * Decimal.getPow10(targetScale) + fractionPart;
    return isNeg ? -total : total;
  }

  public getRawUnits(): bigint {
    return this.units;
  }

  public getScale(): number {
    return this.scale;
  }

  public toMinorUnits(minorScale: number, mode: RoundingMode = 'HALF_UP'): bigint {
    const rounded = this.round(minorScale, mode);
    const diff = this.scale - minorScale;
    if (diff > 0) {
      return rounded.units / Decimal.getPow10(diff);
    } else if (diff < 0) {
      return rounded.units * Decimal.getPow10(-diff);
    }
    return rounded.units;
  }

  public static from(value: number | string | bigint | Decimal, scale: number = Decimal.DEFAULT_SCALE): Decimal {
    return new Decimal(value, scale);
  }

  public static zero(scale: number = Decimal.DEFAULT_SCALE): Decimal {
    return new Decimal(0n, scale);
  }

  public add(other: Decimal | number | string): Decimal {
    const o = other instanceof Decimal ? other : new Decimal(other, this.scale);
    const maxScale = Math.max(this.scale, o.scale);
    const u1 = Decimal.rescaleUnits(this.units, this.scale, maxScale);
    const u2 = Decimal.rescaleUnits(o.units, o.scale, maxScale);
    return Decimal.fromRaw(u1 + u2, maxScale);
  }

  public sub(other: Decimal | number | string): Decimal {
    const o = other instanceof Decimal ? other : new Decimal(other, this.scale);
    const maxScale = Math.max(this.scale, o.scale);
    const u1 = Decimal.rescaleUnits(this.units, this.scale, maxScale);
    const u2 = Decimal.rescaleUnits(o.units, o.scale, maxScale);
    return Decimal.fromRaw(u1 - u2, maxScale);
  }

  public mul(other: Decimal | number | string): Decimal {
    const o = other instanceof Decimal ? other : new Decimal(other, this.scale);
    const product = this.units * o.units;
    const totalScale = this.scale + o.scale;
    const rescaled = Decimal.rescaleUnits(product, totalScale, this.scale);
    return Decimal.fromRaw(rescaled, this.scale);
  }

  public div(other: Decimal | number | string, precision: number = this.scale): Decimal {
    const o = other instanceof Decimal ? other : new Decimal(other, this.scale);
    if (o.units === 0n) {
      throw new RangeError('Division by zero in Decimal calculation');
    }
    const extraScale = precision + this.scale;
    const scaledNumerator = this.units * Decimal.getPow10(extraScale);
    const quotient = scaledNumerator / o.units;
    const finalUnits = Decimal.rescaleUnits(quotient, extraScale, precision);
    return Decimal.fromRaw(finalUnits, precision);
  }

  public round(decimalPlaces: number = 2, mode: RoundingMode = 'HALF_UP'): Decimal {
    if (decimalPlaces >= this.scale) return this;
    const diff = this.scale - decimalPlaces;
    const factor = Decimal.getPow10(diff);
    const halfFactor = factor / 2n;

    const isNegative = this.units < 0n;
    const absUnits = isNegative ? -this.units : this.units;
    const integerPart = absUnits / factor;
    const remainder = absUnits % factor;

    let roundedInt = integerPart;

    switch (mode) {
      case 'HALF_UP':
        if (remainder >= halfFactor) {
          roundedInt += 1n;
        }
        break;
      case 'HALF_DOWN':
        if (remainder > halfFactor) {
          roundedInt += 1n;
        }
        break;
      case 'HALF_EVEN': // Banker's Rounding
        if (remainder > halfFactor) {
          roundedInt += 1n;
        } else if (remainder === halfFactor) {
          if (integerPart % 2n !== 0n) {
            roundedInt += 1n;
          }
        }
        break;
      case 'UP':
      case 'CEIL':
        if (remainder > 0n) {
          roundedInt += isNegative && mode === 'CEIL' ? 0n : 1n;
        }
        break;
      case 'DOWN':
      case 'FLOOR':
        if (remainder > 0n && isNegative && mode === 'FLOOR') {
          roundedInt += 1n;
        }
        break;
    }

    const finalUnits = (isNegative ? -roundedInt : roundedInt) * Decimal.getPow10(diff);
    return Decimal.fromRaw(finalUnits, this.scale);
  }

  public toNumber(): number {
    return Number(this.toString());
  }

  public toString(decimalPlaces?: number): string {
    const isNeg = this.units < 0n;
    const absUnits = isNeg ? -this.units : this.units;
    const factor = Decimal.getPow10(this.scale);
    const intPart = absUnits / factor;
    const fracPart = absUnits % factor;

    let fracStr = fracPart.toString().padStart(this.scale, '0');
    if (decimalPlaces !== undefined) {
      const rounded = this.round(decimalPlaces, 'HALF_UP');
      return rounded.toString();
    }

    // Trim trailing zeroes for clean display
    fracStr = fracStr.replace(/0+$/, '');
    if (fracStr.length === 0) {
      return `${isNeg ? '-' : ''}${intPart.toString()}`;
    }
    return `${isNeg ? '-' : ''}${intPart.toString()}.${fracStr}`;
  }

  public toFixed(decimalPlaces: number = 2, mode: RoundingMode = 'HALF_UP'): string {
    const rounded = this.round(decimalPlaces, mode);
    const isNeg = rounded.units < 0n;
    const absUnits = isNeg ? -rounded.units : rounded.units;
    const factor = Decimal.getPow10(this.scale);
    const intPart = absUnits / factor;
    if (decimalPlaces === 0) {
      return `${isNeg ? '-' : ''}${intPart.toString()}`;
    }
    const diff = this.scale - decimalPlaces;
    const displayFraction = (absUnits % factor) / (diff > 0 ? Decimal.getPow10(diff) : 1n);

    const fracStr = displayFraction.toString().padStart(decimalPlaces, '0').slice(0, decimalPlaces);
    return `${isNeg ? '-' : ''}${intPart.toString()}.${fracStr}`;
  }

  public equals(other: Decimal | number | string): boolean {
    const o = other instanceof Decimal ? other : new Decimal(other, this.scale);
    const maxScale = Math.max(this.scale, o.scale);
    const u1 = Decimal.rescaleUnits(this.units, this.scale, maxScale);
    const u2 = Decimal.rescaleUnits(o.units, o.scale, maxScale);
    return u1 === u2;
  }

  public greaterThan(other: Decimal | number | string): boolean {
    const o = other instanceof Decimal ? other : new Decimal(other, this.scale);
    const maxScale = Math.max(this.scale, o.scale);
    return Decimal.rescaleUnits(this.units, this.scale, maxScale) > Decimal.rescaleUnits(o.units, o.scale, maxScale);
  }

  public lessThan(other: Decimal | number | string): boolean {
    const o = other instanceof Decimal ? other : new Decimal(other, this.scale);
    const maxScale = Math.max(this.scale, o.scale);
    return Decimal.rescaleUnits(this.units, this.scale, maxScale) < Decimal.rescaleUnits(o.units, o.scale, maxScale);
  }

  public isZero(): boolean {
    return this.units === 0n;
  }

  public isNegative(): boolean {
    return this.units < 0n;
  }

  public isPositive(): boolean {
    return this.units > 0n;
  }
}
