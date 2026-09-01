import { describe, expect, it } from 'vitest';
import {
  DoubleEntryEngine,
  MixedCurrencyError,
  NegativeAmountError,
} from '../domain/accounting/doubleEntryEngine';
import { Money } from '../domain/financial/money';

function balances(engine: DoubleEntryEngine, tenantId: string) {
  return engine.getAccounts(tenantId).map(account => [account.code, account.balance.minorUnits.toString()]);
}

function entry(tenantId: string, id: string, debit: Money, credit: Money) {
  return {
    tenantId,
    branchId: 'branch-01',
    entryNumber: `JE-${id}`,
    date: '2026-09-01',
    reference: id,
    sourceType: 'MANUAL_JOURNAL' as const,
    sourceId: id,
    idempotencyKey: `idempotency-${id}`,
    memo: id,
    postedBy: 'test-suite',
    postedAt: '2026-09-01T00:00:00.000Z',
    lines: [
      { id: `${id}-1`, accountId: `coa-1010-${tenantId}`, accountCode: '1010', accountName: 'Cash', debit, credit: Money.zero(debit.currency) },
      { id: `${id}-2`, accountId: `coa-3010-${tenantId}`, accountCode: '3010', accountName: 'Equity', debit: Money.zero(credit.currency), credit },
    ],
  };
}

describe('journal entry integrity', () => {
  it('rejects negative amounts without changing balances', () => {
    const tenantId = 'tenant-negative-entry';
    const engine = new DoubleEntryEngine(tenantId);
    const before = balances(engine, tenantId);

    expect(() => engine.postJournalEntry(entry(
      tenantId,
      'negative',
      Money.fromMajor(-10, 'SAR'),
      Money.fromMajor(-10, 'SAR'),
    ))).toThrow(NegativeAmountError);
    expect(balances(engine, tenantId)).toEqual(before);
    expect(engine.getEntries(tenantId)).toHaveLength(0);
  });

  it('rejects mixed currencies without changing balances', () => {
    const tenantId = 'tenant-mixed-currency';
    const engine = new DoubleEntryEngine(tenantId);
    const before = balances(engine, tenantId);

    expect(() => engine.postJournalEntry(entry(
      tenantId,
      'mixed-currency',
      Money.fromMajor(10, 'SAR'),
      Money.fromMajor(10, 'USD'),
    ))).toThrow(MixedCurrencyError);
    expect(balances(engine, tenantId)).toEqual(before);
    expect(engine.getEntries(tenantId)).toHaveLength(0);
  });

  it('does not apply earlier intended changes when a later account validation fails', () => {
    const tenantId = 'tenant-atomic-validation';
    const engine = new DoubleEntryEngine(tenantId);
    const before = balances(engine, tenantId);
    const invalidAccountCurrencyEntry = entry(
      tenantId,
      'account-currency-failure',
      Money.fromMajor(10, 'USD'),
      Money.fromMajor(10, 'USD'),
    );
    invalidAccountCurrencyEntry.lines[0].accountCode = '7777';
    invalidAccountCurrencyEntry.lines[0].accountId = `coa-7777-${tenantId}`;

    expect(() => engine.postJournalEntry(invalidAccountCurrencyEntry)).toThrow(/Currency mismatch/);
    expect(balances(engine, tenantId)).toEqual(before);
    expect(engine.getAccountByCode(tenantId, '7777')).toBeUndefined();
    expect(engine.getEntries(tenantId)).toHaveLength(0);
  });

  it('leaves the original entry unreversed when reversal posting fails', () => {
    const tenantId = 'tenant-failed-reversal';
    const engine = new DoubleEntryEngine(tenantId);
    const original = engine.postJournalEntry(entry(
      tenantId,
      'original',
      Money.fromMajor(10, 'SAR'),
      Money.fromMajor(10, 'SAR'),
    ));
    original.lines[0].credit = Money.fromMajor(-1, 'SAR');

    expect(() => engine.reverseJournalEntry({
      tenantId,
      originalEntryId: original.id,
      reason: 'forced failure',
      postedBy: 'test-suite',
    })).toThrow(NegativeAmountError);

    const storedOriginal = engine.getEntries(tenantId).find(item => item.id === original.id);
    expect(storedOriginal?.isReversed).toBe(false);
    expect(storedOriginal?.reversalEntryId).toBeUndefined();
  });
});
