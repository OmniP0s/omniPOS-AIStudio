// ============================================================================
// DOCUMENT INTELLIGENCE ENGINE (PDF, EXCEL, WORD, CONTRACTS, BALADY)
// SPRINT 3.3
// ============================================================================

import { DocumentIntelligenceReport, EnterpriseDocFormat } from '../types';

export class DocumentIntelligenceEngine {
  private documentRepository: Map<string, DocumentIntelligenceReport> = new Map();

  constructor() {
    this.initSampleDocs();
  }

  private initSampleDocs(): void {
    const doc1: DocumentIntelligenceReport = {
      documentId: 'doc-contract-meat-01',
      documentName: 'Al-Watania_Master_Meat_Supply_Agreement_2026.pdf',
      format: 'PDF',
      documentCategory: 'SUPPLIER_MASTER_AGREEMENT',
      extractedKeyValues: {
        SupplierEntity: 'Al-Watania Poultry & Meat Trading Co. LLC',
        BuyerEntity: 'OmniPOS Fine Dining Restaurant Group',
        ContractTermMonths: 24,
        PaymentTermsDays: 30,
        MinimumOrderValueSar: 5000,
        RebateTierPercentage: '5% rebate above SAR 150,000 monthly volume',
        GoverningLaw: 'Kingdom of Saudi Arabia (Commercial Courts of Riyadh)',
      },
      extractedClauses: [
        {
          clauseTitleEn: 'SLA Cold-Chain Temperature Guarantee',
          clauseTitleAr: 'ضمان درجات حرارة سلسلة التبريد',
          clauseSummary: 'All chilled Wagyu and poultry deliveries must maintain strict internal temperature below 2.0°C upon arrival with digital data logger verification.',
          riskLevel: 'MEDIUM',
          penaltyTerms: 'Automatic rejection and 10% invoice penalty for temperature breaches.',
          slaDays: 1,
        },
        {
          clauseTitleEn: 'Price Indexation & Stability Lock',
          clauseTitleAr: 'تثبيت وتعديل أسعار التوريد',
          clauseSummary: 'Fixed pricing locked for Q3 and Q4 2026. Price adjustments require 45-day written notice and mutual consent.',
          riskLevel: 'LOW',
          penaltyTerms: 'N/A',
        },
        {
          clauseTitleEn: 'Exclusivity & Halal Slaughter Certification',
          clauseTitleAr: 'شهادة الذبح الحلال والامتثال الشرعي',
          clauseSummary: 'Mandatory SFDA (Saudi Food and Drug Authority) and SASO Halal certification certificates attached with each batch consignment.',
          riskLevel: 'CRITICAL',
          penaltyTerms: 'Immediate contract termination and reporting to authorities for unverified certification.',
        },
      ],
      criticalDates: [
        { label: 'Contract Effective Date', date: '2026-01-01', daysRemaining: 0, status: 'ACTIVE' },
        { label: 'Annual Rebate Audit', date: '2026-12-31', daysRemaining: 125, status: 'ACTIVE' },
        { label: 'Contract Expiration Date', date: '2027-12-31', daysRemaining: 490, status: 'ACTIVE' },
      ],
      complianceScorePct: 98.6,
      recommendedActions: [
        'Automate cold-chain IoT temperature logging on goods receipt note (GRN).',
        'Verify SFDA batch certificates against Saudi ZATCA & Food Authority e-ledger.',
      ],
      processedAt: new Date().toISOString(),
    };

    const doc2: DocumentIntelligenceReport = {
      documentId: 'doc-balady-license-02',
      documentName: 'Balady_Commercial_Food_Premises_License_Olaya.pdf',
      format: 'PDF',
      documentCategory: 'MUNICIPAL_BALADY_PERMIT',
      extractedKeyValues: {
        LicenseNumber: 'BALADY-MOMRA-2026-99381',
        Municipality: 'Riyadh Municipality — Olaya Sub-Municipality',
        PermittedActivity: 'Class-A Restaurant with Kitchen, Drive-thru and Seating',
        MaxOccupancyGuests: 180,
        CivilDefenseClearanceId: 'CD-RYD-88219-OK',
      },
      extractedClauses: [
        {
          clauseTitleEn: 'Health Certificate Requirements for Staff',
          clauseTitleAr: 'الشهادات الصحية للعاملين',
          clauseSummary: 'All kitchen and food service personnel must hold active Balady digital health cards with periodic medical checkups.',
          riskLevel: 'HIGH',
          penaltyTerms: 'Municipal fine of SAR 5,000 per uncertified employee and potential branch closure.',
        },
        {
          clauseTitleEn: 'Grease Trap & Environmental Discharge',
          clauseTitleAr: 'مصائد الشحوم والامتثال البيئي',
          clauseSummary: 'Quarterly maintenance and certified grease disposal receipts required on record.',
          riskLevel: 'MEDIUM',
          penaltyTerms: 'SAR 2,500 fine for unrecorded waste removal.',
        },
      ],
      criticalDates: [
        { label: 'Annual Health Card Renewal (14 Staff)', date: '2026-09-30', daysRemaining: 33, status: 'UPCOMING_EXPIRY' },
        { label: 'Municipal Balady License Renewal', date: '2027-04-15', daysRemaining: 230, status: 'ACTIVE' },
      ],
      complianceScorePct: 96.0,
      recommendedActions: [
        'Schedule medical checkups for 3 culinary apprentices before Sept 30.',
        'Upload certified grease-trap disposal log to Balady portal.',
      ],
      processedAt: new Date().toISOString(),
    };

    this.documentRepository.set(doc1.documentId, doc1);
    this.documentRepository.set(doc2.documentId, doc2);
  }

  public getAllDocuments(): DocumentIntelligenceReport[] {
    return Array.from(this.documentRepository.values());
  }

  public analyzeDocument(
    fileName: string,
    fileFormat: EnterpriseDocFormat,
    category: 'SUPPLIER_MASTER_AGREEMENT' | 'COMMERCIAL_LEASE' | 'MUNICIPAL_BALADY_PERMIT' | 'FOOD_SAFETY_AUDIT' | 'PRICE_CATALOG'
  ): DocumentIntelligenceReport {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const report: DocumentIntelligenceReport = {
      documentId: docId,
      documentName: fileName,
      format: fileFormat,
      documentCategory: category,
      extractedKeyValues: {
        IngestedFileSize: '2.4 MB',
        ParserConfidence: '99.4%',
        ExtractedEntityCount: 18,
        LanguageDetected: 'Bilingual (Arabic / English)',
      },
      extractedClauses: [
        {
          clauseTitleEn: 'Automatic Renewal Notice Window',
          clauseTitleAr: 'فترة إشعار التجديد التلقائي',
          clauseSummary: 'Contract will automatically renew unless terminated in writing 60 days prior to expiry.',
          riskLevel: 'MEDIUM',
          slaDays: 60,
        },
        {
          clauseTitleEn: 'Indemnification & Food Safety Liability',
          clauseTitleAr: 'التعويض والمسؤولية عن سلامة الأغذية',
          clauseSummary: 'Supplier maintains full product liability coverage up to SAR 10,000,000 for any contamination or supply defect.',
          riskLevel: 'LOW',
        },
      ],
      criticalDates: [
        { label: 'Notice Deadline', date: '2026-11-15', daysRemaining: 79, status: 'ACTIVE' },
        { label: 'Expiry Date', date: '2027-01-15', daysRemaining: 140, status: 'ACTIVE' },
      ],
      complianceScorePct: 97.2,
      recommendedActions: [
        'Add contract renewal notice reminder to ERP procurement calendar.',
        'Archive signed PDF copy into enterprise document ledger with SHA-256 hash.',
      ],
      processedAt: new Date().toISOString(),
    };

    this.documentRepository.set(docId, report);
    return report;
  }
}

export const documentIntelligenceEngine = new DocumentIntelligenceEngine();
