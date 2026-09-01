import { describe, expect, it } from 'vitest';
import { DoubleEntryEngine } from '../domain/accounting/doubleEntryEngine';
import { Money } from '../domain/financial/money';

const DEFAULT_ACCOUNT_CODES = [
  '1010', '1020', '1030', '1040', '1050', '1060', '1510',
  '2010', '2020', '2030', '2040', '2050',
  '3010', '3020',
  '4010', '4020', '4030', '4090',
  '5010', '5020', '5030', '5040', '5090',
  '6010', '6020', '6030', '6050', '6070',
];

describe('default chart of accounts opening balances', () => {
  it('initializes every account at zero without changing the chart structure', () => {
    const tenantId = 'tenant-zero-opening-balances';
    const accounts = new DoubleEntryEngine(tenantId).getAccounts(tenantId);

    expect(accounts.map(account => account.code)).toEqual(DEFAULT_ACCOUNT_CODES);
    expect(accounts.every(account => account.balance.isZero())).toBe(true);
  });

  it('changes only accounts affected by a posted journal entry', () => {
    const tenantId = 'tenant-single-opening-entry';
    const engine = new DoubleEntryEngine(tenantId);

    engine.postJournalEntry({
      tenantId,
      branchId: 'branch-01',
      entryNumber: 'JE-OPENING-TEST',
      date: '2026-09-01',
      reference: 'opening-test',
      sourceType: 'MANUAL_JOURNAL',
      sourceId: 'opening-test',
      idempotencyKey: 'opening-test',
      memo: 'Post one balanced entry from a zero state',
      postedBy: 'test-suite',
      postedAt: '2026-09-01T00:00:00.000Z',
      lines: [
        {
          id: 'opening-test-1', accountId: `coa-1010-${tenantId}`, accountCode: '1010',
          accountName: 'Cash', debit: Money.fromMajor(25), credit: Money.zero('SAR'),
        },
        {
          id: 'opening-test-2', accountId: `coa-3010-${tenantId}`, accountCode: '3010',
          accountName: 'Equity', debit: Money.zero('SAR'), credit: Money.fromMajor(25),
        },
      ],
    });

    for (const account of engine.getAccounts(tenantId)) {
      if (account.code === '1010' || account.code === '3010') {
        expect(account.balance.toMajor()).toBe(25);
      } else {
        expect(account.balance.isZero()).toBe(true);
      }
    }
  });
});
