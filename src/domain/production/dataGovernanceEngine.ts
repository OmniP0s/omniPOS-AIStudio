import { DataEntityLineage } from '../../types/production';

export interface DataQualityRule {
  id: string;
  entityName: string;
  ruleType: 'COMPLETENESS' | 'ACCURACY' | 'VALIDITY' | 'CONSISTENCY' | 'UNIQUENESS';
  ruleDescription: string;
  targetField: string;
  passRatePercent: number;
  recordsChecked: number;
  violationsCount: number;
  status: 'HEALTHY' | 'WARNING' | 'FAILED';
}

export interface DuplicateRecordCandidate {
  id: string;
  entityType: 'CUSTOMER' | 'SUPPLIER' | 'MENU_ITEM' | 'INVENTORY_ITEM';
  recordA: { id: string; name: string; keyField: string };
  recordB: { id: string; name: string; keyField: string };
  similarityScorePercent: number;
  matchReasons: string[];
  status: 'PENDING_REVIEW' | 'MERGED' | 'DISMISSED';
}

export class EnterpriseDataGovernanceEngine {
  private lineageList: DataEntityLineage[] = [
    {
      id: 'LIN-001',
      entityName: 'POS_ORDER_TRANSACTION',
      classification: 'FINANCIAL',
      sourceSystem: 'POS Terminal Client (Edge SQLite/CRDT)',
      storageTarget: 'PostgreSQL Orders Table & TimescaleDB',
      transformations: [
        'VatCalculation(15%)',
        'DiscountAllocation()',
        'ZatcaCryptographicHashGenerator()',
        'GeneralLedgerJournalPost()',
      ],
      downstreamConsumers: [
        'ZATCA Fatoora API v2.8',
        'Kitchen Display System (KDS)',
        'Enterprise BI Warehouse (ClickHouse)',
        'Mada Settlement Gateway',
      ],
      qualityScore: 99.98,
      retentionPeriodMonths: 72,
      anonymized: false,
    },
    {
      id: 'LIN-002',
      entityName: 'CUSTOMER_PROFILE_PII',
      classification: 'PII',
      sourceSystem: 'OmniPOS Loyalty Web/App / POS Mobile Entry',
      storageTarget: 'PostgreSQL Encrypted Partition (AES-256)',
      transformations: [
        'KsaPhoneSanitization(+966)',
        'NameNormalization()',
        'HashedNationalId()',
        'MaskedForCashierDisplay()',
      ],
      downstreamConsumers: [
        'Loyalty Reward Points Engine',
        'SMS/WhatsApp OTP Service (Unifonic)',
        'AI Customer Lifetime Value Engine',
      ],
      qualityScore: 99.45,
      retentionPeriodMonths: 36,
      anonymized: true,
    },
    {
      id: 'LIN-003',
      entityName: 'SUPPLIER_INVOICE_AND_3WAY_MATCH',
      classification: 'CONFIDENTIAL',
      sourceSystem: 'Procurement Portal / OCR Invoice Scan',
      storageTarget: 'PostgreSQL Procurement DB',
      transformations: [
        '3WayMatching(PO, GRN, Bill)',
        'LandedCostDistribution()',
        'VatTaxCreditVerification()',
      ],
      downstreamConsumers: [
        'SAP S/4HANA ERP Connector',
        'Accounts Payable General Ledger',
        'Inventory Cost Recalculation (FIFO/WAC)',
      ],
      qualityScore: 99.82,
      retentionPeriodMonths: 120,
      anonymized: false,
    }
  ];

  private qualityRules: DataQualityRule[] = [
    {
      id: 'DQR-001',
      entityName: 'Customer',
      ruleType: 'VALIDITY',
      ruleDescription: 'Valid Saudi mobile phone starting with +9665 or 05 and length 10 digits',
      targetField: 'phone',
      passRatePercent: 99.85,
      recordsChecked: 15420,
      violationsCount: 23,
      status: 'HEALTHY',
    },
    {
      id: 'DQR-002',
      entityName: 'Invoice',
      ruleType: 'CONSISTENCY',
      ruleDescription: 'Sum of line item totals + VAT must equal grandTotal within 0.01 SAR rounding threshold',
      targetField: 'grandTotal',
      passRatePercent: 100.0,
      recordsChecked: 48920,
      violationsCount: 0,
      status: 'HEALTHY',
    },
    {
      id: 'DQR-003',
      entityName: 'Supplier',
      ruleType: 'ACCURACY',
      ruleDescription: '15-digit ZATCA VAT number starting and ending with 3',
      targetField: 'vatNumber',
      passRatePercent: 100.0,
      recordsChecked: 340,
      violationsCount: 0,
      status: 'HEALTHY',
    },
    {
      id: 'DQR-004',
      entityName: 'MenuItem',
      ruleType: 'COMPLETENESS',
      ruleDescription: 'Bilingual name (English + Arabic) and standard cost BOM linked',
      targetField: 'nameAr, nameEn, bomId',
      passRatePercent: 99.2,
      recordsChecked: 1250,
      violationsCount: 10,
      status: 'HEALTHY',
    }
  ];

  private duplicates: DuplicateRecordCandidate[] = [
    {
      id: 'DUP-001',
      entityType: 'CUSTOMER',
      recordA: { id: 'CUST-1042', name: 'Abdulaziz Al-Ghamdi', keyField: '0501234567' },
      recordB: { id: 'CUST-2901', name: 'Abdul Aziz Al Ghamdi', keyField: '+966501234567' },
      similarityScorePercent: 96,
      matchReasons: ['Normalized phone match (+966)', 'Levenshtein Arabic/English name distance = 1'],
      status: 'PENDING_REVIEW',
    },
    {
      id: 'DUP-002',
      entityType: 'INVENTORY_ITEM',
      recordA: { id: 'INV-109', name: 'Whole Milk 1L Almarai', keyField: 'SKU-MILK-001' },
      recordB: { id: 'INV-110', name: 'Almarai Fresh Milk 1 Liter', keyField: 'SKU-ALM-1L' },
      similarityScorePercent: 91,
      matchReasons: ['Tokenized brand match (Almarai)', 'Unit of measurement equivalence (1L = 1 Liter)'],
      status: 'PENDING_REVIEW',
    }
  ];

  public getLineages(): DataEntityLineage[] {
    return this.lineageList;
  }

  public getQualityRules(): DataQualityRule[] {
    return this.qualityRules;
  }

  public getDuplicates(): DuplicateRecordCandidate[] {
    return this.duplicates;
  }

  public resolveDuplicate(id: string, action: 'MERGE' | 'DISMISS'): DuplicateRecordCandidate {
    const dup = this.duplicates.find(d => d.id === id);
    if (!dup) throw new Error(`Duplicate record ${id} not found`);
    dup.status = action === 'MERGE' ? 'MERGED' : 'DISMISSED';
    return dup;
  }
}

export const dataGovernanceEngine = new EnterpriseDataGovernanceEngine();
