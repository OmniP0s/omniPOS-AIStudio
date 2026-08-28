// ============================================================================
// CUSTOMER PORTAL & TENANT SELF-SERVICE PROVISIONING ENGINE
// ============================================================================

import {
  PortalUserInvitation,
  TenantProvisioningRequest,
  TenantProvisioningResult,
} from '../types';
import { licenseEngine } from '../core/licenseEngine';

export class CustomerPortalEngine {
  private invitations: Map<string, PortalUserInvitation[]> = new Map();
  private provisionedTenants: Map<string, TenantProvisioningResult> = new Map();

  constructor() {
    this.seedDefaultInvitations();
  }

  private seedDefaultInvitations(): void {
    const defaultInvs: PortalUserInvitation[] = [
      {
        invitationId: 'inv-usr-8812',
        tenantId: 'tenant-omnipos-sa',
        email: 'tariq.manager@aldiyafah.sa',
        fullName: 'طارق العمري (Tariq Al-Omari)',
        role: 'BRANCH_MANAGER',
        assignedBranches: ['BR-OLAYA-01', 'BR-SAHAP-02'],
        status: 'ACCEPTED',
        invitedBy: 'superadmin@aldiyafah.sa',
        invitedAt: '2026-08-01T10:00:00Z',
        expiresAt: '2026-08-08T10:00:00Z',
        invitationToken: 'tok_sec_9918231023812',
      },
      {
        invitationId: 'inv-usr-8813',
        tenantId: 'tenant-omnipos-sa',
        email: 'noura.finance@aldiyafah.sa',
        fullName: 'نورة السبيعي (Noura Al-Subaie)',
        role: 'ACCOUNTANT',
        assignedBranches: ['ALL_BRANCHES'],
        status: 'ACCEPTED',
        invitedBy: 'superadmin@aldiyafah.sa',
        invitedAt: '2026-08-05T14:30:00Z',
        expiresAt: '2026-08-12T14:30:00Z',
        invitationToken: 'tok_sec_1928301928301',
      },
      {
        invitationId: 'inv-usr-8814',
        tenantId: 'tenant-omnipos-sa',
        email: 'chef.yousef@aldiyafah.sa',
        fullName: 'الشيف يوسف الحربي (Chef Yousef)',
        role: 'KITCHEN_LEAD',
        assignedBranches: ['BR-OLAYA-01'],
        status: 'PENDING',
        invitedBy: 'superadmin@aldiyafah.sa',
        invitedAt: '2026-08-27T09:15:00Z',
        expiresAt: '2026-09-03T09:15:00Z',
        invitationToken: 'tok_sec_3829102938102',
      },
    ];

    this.invitations.set('tenant-omnipos-sa', defaultInvs);
  }

  public getInvitations(tenantId: string): PortalUserInvitation[] {
    return this.invitations.get(tenantId) || this.invitations.get('tenant-omnipos-sa') || [];
  }

  public createInvitation(
    tenantId: string,
    email: string,
    fullName: string,
    role: PortalUserInvitation['role'],
    assignedBranches: string[],
    invitedBy: string
  ): PortalUserInvitation {
    const invId = `inv-usr-${Date.now().toString().slice(-6)}`;
    const newInv: PortalUserInvitation = {
      invitationId: invId,
      tenantId,
      email,
      fullName,
      role,
      assignedBranches,
      status: 'PENDING',
      invitedBy,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      invitationToken: `tok_${Math.random().toString(36).substring(2)}${Date.now()}`,
    };

    const existing = this.invitations.get(tenantId) || [];
    existing.unshift(newInv);
    this.invitations.set(tenantId, existing);
    return newInv;
  }

  public revokeInvitation(tenantId: string, invitationId: string): void {
    const list = this.invitations.get(tenantId) || [];
    const target = list.find((i) => i.invitationId === invitationId);
    if (target) {
      target.status = 'REVOKED';
    }
  }

  public provisionNewTenant(req: TenantProvisioningRequest): TenantProvisioningResult {
    const tenantId = `tenant-${req.customSubdomain.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const orgId = `org-${req.customSubdomain.toLowerCase()}`;

    const branchesCount = req.selectedPlan === 'STARTER' ? 2 : req.selectedPlan === 'GROWTH' ? 10 : 50;
    const terminalsCount = req.selectedPlan === 'STARTER' ? 4 : req.selectedPlan === 'GROWTH' ? 30 : 200;

    const license = licenseEngine.generateLicense(tenantId, req.selectedPlan, branchesCount, terminalsCount);

    const result: TenantProvisioningResult = {
      tenantId,
      organizationId: orgId,
      subdomainUrl: `https://${req.customSubdomain.toLowerCase()}.omnipos.sa`,
      adminCredentialsProvisioned: true,
      databaseSchemaCreated: true,
      zatcaGatewayInitialized: true,
      licenseKey: license,
      status: 'PROVISIONED',
      provisionedAt: new Date().toISOString(),
    };

    this.provisionedTenants.set(tenantId, result);
    return result;
  }

  public getProvisionedTenant(tenantId: string): TenantProvisioningResult | undefined {
    return this.provisionedTenants.get(tenantId);
  }
}

export const customerPortalEngine = new CustomerPortalEngine();
