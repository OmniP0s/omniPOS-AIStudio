// Franchise & Multi-Unit Corporate Management Engine
import { Franchisee, CorporateMenuDistribution } from '../../types';

export class FranchiseEngine {
  private franchisees: Franchisee[] = [
    {
      id: 'FRAN-01',
      agreementNumber: 'FA-KSA-2025-001',
      legalEntityName: 'Al-Majd Food Services Holding Co.',
      territoryRegion: 'Western Province (Jeddah & Makkah)',
      royaltyFeePercent: 5.0,
      marketingFundFeePercent: 2.0,
      assignedBranches: ['b2', 'b-jeddah-01', 'b-makkah-01'],
      contractStartDate: '2025-01-01',
      contractExpiryDate: '2030-12-31',
      complianceScorePercent: 97.4,
      status: 'ACTIVE',
      totalRevenueYtdSar: 1845000,
      royaltiesDueSar: 92250,
    },
    {
      id: 'FRAN-02',
      agreementNumber: 'FA-KSA-2025-002',
      legalEntityName: 'Eastern Gastronomy Hospitality Group',
      territoryRegion: 'Eastern Province (Dammam & Khobar)',
      royaltyFeePercent: 5.0,
      marketingFundFeePercent: 2.0,
      assignedBranches: ['b-dammam-01', 'b-khobar-01'],
      contractStartDate: '2025-03-15',
      contractExpiryDate: '2030-03-14',
      complianceScorePercent: 94.8,
      status: 'ACTIVE',
      totalRevenueYtdSar: 1220000,
      royaltiesDueSar: 61000,
    },
    {
      id: 'FRAN-03',
      agreementNumber: 'FA-KSA-2026-003',
      legalEntityName: 'Qassim Modern Dining LLC',
      territoryRegion: 'Qassim & Northern Region',
      royaltyFeePercent: 4.5,
      marketingFundFeePercent: 2.0,
      assignedBranches: ['b-buraidah-01'],
      contractStartDate: '2026-02-01',
      contractExpiryDate: '2031-01-31',
      complianceScorePercent: 91.2,
      status: 'AUDIT_REQUIRED',
      totalRevenueYtdSar: 430000,
      royaltiesDueSar: 19350,
    },
  ];

  private menuDistributions: CorporateMenuDistribution[] = [
    {
      id: 'dist-01',
      templateName: 'National Winter 2026 Promo Menu',
      targetRegions: ['Western Province', 'Eastern Province', 'Central Province'],
      targetBranches: ['b1', 'b2'],
      version: 'v2.4.0',
      effectiveDate: '2026-09-01',
      priceAdjustmentType: 'PERCENT_INCREASE',
      priceAdjustmentValue: 0.0,
      status: 'PUBLISHED',
    },
    {
      id: 'dist-02',
      templateName: 'Eastern Region Seafood Specials',
      targetRegions: ['Eastern Province'],
      targetBranches: ['b-dammam-01', 'b-khobar-01'],
      version: 'v1.1.0',
      effectiveDate: '2026-09-15',
      priceAdjustmentType: 'PERCENT_INCREASE',
      priceAdjustmentValue: 5.0, // +5% for coastal branches
      status: 'STAGED',
    },
  ];

  public getFranchisees(): Franchisee[] {
    return this.franchisees;
  }

  public getDistributions(): CorporateMenuDistribution[] {
    return this.menuDistributions;
  }

  public calculateRoyalties(franchiseeId: string, grossSales: number): {
    royaltyAmountSar: number;
    marketingFundAmountSar: number;
    totalDueSar: number;
  } {
    const f = this.franchisees.find(item => item.id === franchiseeId);
    if (!f) return { royaltyAmountSar: 0, marketingFundAmountSar: 0, totalDueSar: 0 };

    const royaltyAmountSar = (grossSales * f.royaltyFeePercent) / 100;
    const marketingFundAmountSar = (grossSales * f.marketingFundFeePercent) / 100;
    return {
      royaltyAmountSar,
      marketingFundAmountSar,
      totalDueSar: royaltyAmountSar + marketingFundAmountSar,
    };
  }

  public publishCorporateMenu(template: Omit<CorporateMenuDistribution, 'id' | 'status'>): CorporateMenuDistribution {
    const newDist: CorporateMenuDistribution = {
      ...template,
      id: `dist-${Date.now()}`,
      status: 'PUBLISHED',
    };
    this.menuDistributions.unshift(newDist);
    return newDist;
  }
}

export const globalFranchise = new FranchiseEngine();
