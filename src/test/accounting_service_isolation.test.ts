import { describe, expect, it } from 'vitest';
import { getAccountingServices } from '../domain/accounting/accountingEngine';
import { Money } from '../domain/financial/money';

describe('tenant accounting service accessor', () => {
  it('fails closed without a tenant context', () => {
    expect(() => getAccountingServices('')).toThrow('TENANT_CONTEXT_REQUIRED');
    expect(() => getAccountingServices('   ')).toThrow('TENANT_CONTEXT_REQUIRED');
  });

  it('reuses services within one tenant and isolates different tenants', () => {
    const tenantA = getAccountingServices('tenant-accounting-a');
    const tenantAAgain = getAccountingServices('tenant-accounting-a');
    const tenantB = getAccountingServices('tenant-accounting-b');

    expect(tenantAAgain).toBe(tenantA);
    expect(tenantB).not.toBe(tenantA);

    tenantA.engine.postJournalEntry({
      tenantId: 'tenant-accounting-a',
      branchId: 'branch-a',
      entryNumber: 'JE-ISOLATION-A',
      date: '2026-09-01',
      reference: 'isolation-test',
      sourceType: 'MANUAL_JOURNAL',
      sourceId: 'isolation-test-a',
      idempotencyKey: 'isolation-test-a',
      memo: 'Tenant isolation verification',
      postedBy: 'test-suite',
      postedAt: '2026-09-01T00:00:00.000Z',
      lines: [
        {
          id: 'line-a-1', accountId: 'coa-1010-tenant-accounting-a', accountCode: '1010',
          accountName: 'Cash', debit: Money.fromMajor(10), credit: Money.zero('SAR'),
        },
        {
          id: 'line-a-2', accountId: 'coa-3010-tenant-accounting-a', accountCode: '3010',
          accountName: 'Equity', debit: Money.zero('SAR'), credit: Money.fromMajor(10),
        },
      ],
    });

    expect(tenantA.engine.getEntries('tenant-accounting-a')).toHaveLength(1);
    expect(tenantB.engine.getEntries('tenant-accounting-b')).toHaveLength(0);
  });
});
