// ============================================================================
// SAAS CORE: ORGANIZATION & SUBSIDIARY MANAGEMENT ENGINE
// ============================================================================

import { OrganizationHierarchy } from '../types';

export class OrganizationManager {
  private organizations: Map<string, OrganizationHierarchy> = new Map();

  constructor() {
    this.seedDefaultOrganizations();
  }

  private seedDefaultOrganizations(): void {
    const defaultOrg: OrganizationHierarchy = {
      id: 'org-al-diyafah-group',
      name: 'Al-Diyafah Hospitality Group Ltd.',
      legalEntityName: 'شركة الضيافة الفندقية والمطاعم المحدودة',
      commercialRegistrationNumber: '1010892341',
      vatRegistrationNumber: '310928374100003',
      headquartersAddress: {
        street: 'King Fahd Road, Al Olaya District',
        district: 'Al Olaya',
        city: 'Riyadh',
        postalCode: '12214',
        country: 'Saudi Arabia',
      },
      subsidiaries: [
        {
          id: 'sub-central-region',
          name: 'Al-Diyafah Central Operations (Riyadh & Qassim)',
          country: 'Saudi Arabia',
          assignedBranchesCount: 14,
        },
        {
          id: 'sub-western-region',
          name: 'Al-Diyafah Red Sea Branches (Jeddah & Makkah)',
          country: 'Saudi Arabia',
          assignedBranchesCount: 8,
        },
        {
          id: 'sub-eastern-region',
          name: 'Al-Diyafah Gulf Express (Khobar & Dammam)',
          country: 'Saudi Arabia',
          assignedBranchesCount: 6,
        },
        {
          id: 'sub-gulf-intl',
          name: 'Al-Diyafah International UAE (Dubai Mall)',
          country: 'United Arab Emirates',
          assignedBranchesCount: 4,
        },
      ],
      createdAt: '2025-01-15T08:00:00Z',
      status: 'VERIFIED',
    };

    this.organizations.set(defaultOrg.id, defaultOrg);
  }

  public getOrganization(orgId: string): OrganizationHierarchy | undefined {
    return this.organizations.get(orgId);
  }

  public getAllOrganizations(): OrganizationHierarchy[] {
    return Array.from(this.organizations.values());
  }

  public registerOrganization(payload: Omit<OrganizationHierarchy, 'id' | 'createdAt' | 'status'>): OrganizationHierarchy {
    const id = `org-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newOrg: OrganizationHierarchy = {
      ...payload,
      id,
      createdAt: new Date().toISOString(),
      status: 'VERIFIED',
    };
    this.organizations.set(id, newOrg);
    return newOrg;
  }

  public addSubsidiary(orgId: string, subsidiary: { name: string; country: string; assignedBranchesCount: number }): OrganizationHierarchy {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization ${orgId} not found`);
    }

    const subId = `sub-${Date.now().toString(36)}`;
    org.subsidiaries.push({
      id: subId,
      ...subsidiary,
    });

    this.organizations.set(orgId, org);
    return org;
  }

  public updateTaxRegistration(orgId: string, crNumber: string, vatNumber: string): OrganizationHierarchy {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization ${orgId} not found`);
    }

    if (crNumber.length !== 10) {
      throw new Error('Saudi Commercial Registration (CR) must be exactly 10 digits');
    }
    if (vatNumber.length !== 15 || !vatNumber.endsWith('3')) {
      throw new Error('Saudi ZATCA VAT number must be 15 digits ending in 3');
    }

    org.commercialRegistrationNumber = crNumber;
    org.vatRegistrationNumber = vatNumber;
    this.organizations.set(orgId, org);
    return org;
  }
}

export const organizationManager = new OrganizationManager();
