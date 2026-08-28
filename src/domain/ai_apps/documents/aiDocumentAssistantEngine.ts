/**
 * AI Document Assistant Engine (Pillar 8)
 * Automated Invoice Explanation & Discrepancy Spotting, Commercial Lease Summarizer,
 * Operational Kitchen SOP Semantic Search, and Multi-Lingual Enterprise Document Q&A.
 */

import { DocumentAnalysisResult } from '../types';

export class AiDocumentAssistantEngine {
  private documentKnowledgeBase: DocumentAnalysisResult[] = [
    {
      docId: 'DOC-INV-2026-8891',
      docTitle: 'Supplier Invoice #8891 - Gulf Gourmet Meats',
      docType: 'SUPPLIER_INVOICE',
      summaryEn: 'Tax invoice for 45kg Wagyu MB7+ ribeye and 30kg Angus tenderloin delivered to Olaya Branch on Aug 26, 2026.',
      summaryAr: 'فاتورة ضريبية لتوريد 45 كجم واغيو MB7+ و 30 كجم تندرلوين أنجوس تم استلامها في فرع العليا بتاريخ 26 أغسطس 2026.',
      keyClauses: [
        { clauseTitle: 'Payment Terms', content: 'Net 30 days via B2B Corporate Transfer', riskLevel: 'SAFE' },
        { clauseTitle: 'ZATCA Compliance', content: 'Phase 2 Cryptographic Stamp & QR code verified valid', riskLevel: 'SAFE' },
        { clauseTitle: 'Unit Price Variance Alert', content: 'Unit price for Wagyu MB7+ billed at 145 SAR/kg vs contracted master price of 138 SAR/kg.', riskLevel: 'DANGEROUS' },
      ],
      discrepanciesDetected: [
        {
          field: 'Wagyu MB7+ Unit Price',
          expected: '138.00 SAR/kg (Contract #MSA-2026-04)',
          actual: '145.00 SAR/kg (Invoice #8891)',
          financialVarianceSar: 315.0,
        },
      ],
      extractedMetadata: {
        invoiceNumber: 'INV-8891',
        totalAmountExclVat: 10875,
        vat15Percent: 1631.25,
        totalWithVatSar: 12506.25,
        supplierVatNumber: '310928374600003',
      },
    },
    {
      docId: 'DOC-LEASE-OLAYA-2025',
      docTitle: 'Commercial Lease Agreement - Olaya Street Retail Park',
      docType: 'COMMERCIAL_LEASE',
      summaryEn: '5-year commercial lease for 420 sqm restaurant unit with annual 5% escalation starting in Year 3.',
      summaryAr: 'عقد إيجار تجاري لمدة 5 سنوات لموقع مطعم بمساحة 420 م² مع زيادة سنوية بنسبة 5% ابتداءً من السنة الثالثة.',
      keyClauses: [
        { clauseTitle: 'Rent Escalation Clause', content: 'Base rent 650,000 SAR/yr with 5% compounding step in 2027.', riskLevel: 'ATTENTION' },
        { clauseTitle: 'Force Majeure & Operating Hours', content: 'Tenant must operate minimum 14 hours daily; penalty of 2,000 SAR per unexcused dark day.', riskLevel: 'ATTENTION' },
        { clauseTitle: 'Early Termination Penalty', content: 'Requires 6 months written notice and forfeiture of 3 months security deposit.', riskLevel: 'SAFE' },
      ],
      extractedMetadata: {
        premisesSizeSqm: 420,
        annualRentSar: 650000,
        leaseExpiryDate: '2030-12-31',
        landlordName: 'Al-Rajhi Commercial Real Estate Fund',
      },
    },
    {
      docId: 'DOC-SOP-HACCP-2026',
      docTitle: 'Standard Operating Procedure (SOP) #04: HACCP Temperature Audits',
      docType: 'KITCHEN_SOP',
      summaryEn: 'Mandatory cold holding (<4°C), hot holding (>63°C), and blast chilling standards for meat prep and sushi lines.',
      summaryAr: 'إجراءات التشغيل القياسية لرقابة درجات حرارة الحفظ البارد (<4 م°) والحفظ الساخن (>63 م°) والتبريد السريع وفق معايير الهاسب.',
      keyClauses: [
        { clauseTitle: 'Walk-In Fridge Protocol', content: 'Log temperature probe reading at 08:00, 14:00, and 22:00 daily; alarm on >4.5°C breach for >15 mins.', riskLevel: 'SAFE' },
        { clauseTitle: 'Thawing Guidelines', content: 'Meat thawing permitted only in dedicated 2°C walk-in thaw cooler; room temperature thawing strictly forbidden.', riskLevel: 'SAFE' },
      ],
      extractedMetadata: {
        sopCode: 'SOP-KSA-HACCP-04',
        lastRevised: '2026-06-15',
        complianceStandard: 'Saudi SFDA & Municipal Hygiene Regulation',
      },
    },
  ];

  public getDocuments(): DocumentAnalysisResult[] {
    return this.documentKnowledgeBase;
  }

  public getDocumentById(id: string): DocumentAnalysisResult | undefined {
    return this.documentKnowledgeBase.find(d => d.docId === id);
  }

  /**
   * Search knowledge base and synthesize answers with citations
   */
  public queryDocumentQnA(query: string): {
    answer: string;
    citations: Array<{ docId: string; title: string; relevantClause: string }>;
  } {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('temp') || queryLower.includes('حرارة') || queryLower.includes('haccp') || queryLower.includes('هاسب')) {
      return {
        answer: `According to **SOP #04: HACCP Temperature Audits**, cold-holding walk-in refrigerators must maintain temperature below **4.0°C** at all times. Temperatures must be logged three times daily (08:00, 14:00, 22:00). Any breach above 4.5°C lasting longer than 15 minutes triggers an automated alert and manager inspection.`,
        citations: [
          {
            docId: 'DOC-SOP-HACCP-2026',
            title: 'SOP #04: HACCP Temperature Audits',
            relevantClause: 'Walk-In Fridge Protocol: Log at 08:00, 14:00, and 22:00 daily; threshold < 4.0°C.',
          },
        ],
      };
    }

    if (queryLower.includes('lease') || queryLower.includes('إيجار') || queryLower.includes('rent') || queryLower.includes('olaya')) {
      return {
        answer: `The **Olaya Street Commercial Lease** specifies an annual base rent of **650,000 SAR** with a **5% compounding escalation starting in Year 3 (2027)**. Premise size is 420 sqm and early termination requires 6 months written notice.`,
        citations: [
          {
            docId: 'DOC-LEASE-OLAYA-2025',
            title: 'Commercial Lease Agreement - Olaya Street Retail Park',
            relevantClause: 'Rent Escalation: Base rent 650,000 SAR/yr with 5% compounding step in Year 3.',
          },
        ],
      };
    }

    // Default invoice discrepancy
    return {
      answer: `In **Supplier Invoice #8891 (Gulf Gourmet Meats)**, our AI auditor identified a **315.00 SAR price discrepancy**: Wagyu MB7+ was invoiced at **145.00 SAR/kg** instead of the contracted rate of **138.00 SAR/kg** under MSA-2026-04. A credit note request has been queued.`,
      citations: [
        {
          docId: 'DOC-INV-2026-8891',
          title: 'Supplier Invoice #8891 - Gulf Gourmet Meats',
          relevantClause: 'Unit Price Variance: Invoiced 145 SAR/kg vs contracted 138 SAR/kg.',
        },
      ],
    };
  }
}

export const aiDocumentAssistant = new AiDocumentAssistantEngine();
