// ============================================================================
// ENTERPRISE SAAS PLATFORM & COMMERCIALIZATION TYPES (SPRINT 4.0)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. SAAS CORE TYPES
// ----------------------------------------------------------------------------

export type SubscriptionPlanTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'FRANCHISE_GLOBAL';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED';

export interface OrganizationHierarchy {
  id: string;
  name: string;
  legalEntityName: string;
  commercialRegistrationNumber: string; // CR number in Saudi Arabia (10 digits)
  vatRegistrationNumber: string; // 15-digit ZATCA VAT number
  headquartersAddress: {
    street: string;
    district: string;
    city: string;
    postalCode: string;
    country: string;
  };
  subsidiaries: {
    id: string;
    name: string;
    country: string;
    assignedBranchesCount: number;
  }[];
  createdAt: string;
  status: 'VERIFIED' | 'PENDING_AUDIT' | 'ACTIVE';
}

export interface SubscriptionRecord {
  subscriptionId: string;
  tenantId: string;
  tier: SubscriptionPlanTier;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  basePriceSar: number;
  branchLimit: number;
  terminalLimit: number;
  includedZatcaInvoicesMonthly: number;
  includedAiTokensMonthly: number;
  storageLimitGb: number;
  autoRenew: boolean;
  paymentMethod: {
    type: 'MADA' | 'VISA_MASTERCARD' | 'APPLE_PAY' | 'CORPORATE_INVOICE';
    last4: string;
    expiryDate: string;
    isDefault: boolean;
  };
}

export interface SaasInvoiceItem {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  billingPeriod: string;
  issuedDate: string;
  dueDate: string;
  subtotalSar: number;
  vatRatePct: number;
  vatAmountSar: number;
  grandTotalSar: number;
  status: 'PAID' | 'DUE' | 'OVERDUE' | 'VOIDED';
  lineItems: {
    description: string;
    quantity: number;
    unitPriceSar: number;
    totalSar: number;
  }[];
  zatcaQrCodeBase64: string;
  pdfDownloadUrl: string;
}

export interface CryptographicLicenseKey {
  licenseId: string;
  tenantId: string;
  tier: SubscriptionPlanTier;
  issuedAt: string;
  expiresAt: string;
  licensedBranches: number;
  licensedTerminals: number;
  enabledModules: string[];
  signatureEd25519: string;
  rawKeyToken: string;
  isRevoked: boolean;
  hardwareFingerprintBinding?: string;
}

export interface FeatureFlagRule {
  key: string;
  name: string;
  description: string;
  enabledGlobally: boolean;
  rolloutPercentage: number;
  allowedTiers: SubscriptionPlanTier[];
  targetedTenantIds: string[];
  moduleGroup: string;
  updatedAt: string;
}

export interface UsageMetricRecord {
  tenantId: string;
  period: string; // e.g. '2026-08'
  activeBranches: number;
  activeTerminals: number;
  zatcaInvoicesSigned: number;
  aiTokensConsumed: number;
  ordersProcessed: number;
  storageMbUsed: number;
  apiRequestsCount: number;
  calculatedOverageSar: number;
  lastUpdated: string;
}

// ----------------------------------------------------------------------------
// 2. CUSTOMER PORTAL TYPES
// ----------------------------------------------------------------------------

export interface PortalUserInvitation {
  invitationId: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'ACCOUNTANT' | 'KITCHEN_LEAD' | 'CASHIER';
  assignedBranches: string[];
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  invitationToken: string;
}

export interface TenantProvisioningRequest {
  organizationName: string;
  crNumber: string;
  vatNumber: string;
  adminEmail: string;
  adminFullName: string;
  selectedPlan: SubscriptionPlanTier;
  primaryRegion: string;
  initialBranchName: string;
  initialCity: string;
  customSubdomain: string;
}

export interface TenantProvisioningResult {
  tenantId: string;
  organizationId: string;
  subdomainUrl: string;
  adminCredentialsProvisioned: boolean;
  databaseSchemaCreated: boolean;
  zatcaGatewayInitialized: boolean;
  licenseKey: CryptographicLicenseKey;
  status: 'PROVISIONED' | 'FAILED';
  provisionedAt: string;
}

// ----------------------------------------------------------------------------
// 3. MARKETPLACE & EXTENSION SDK TYPES
// ----------------------------------------------------------------------------

export type PluginCategory =
  | 'DELIVERY_AGGREGATOR'
  | 'ACCOUNTING_ERP'
  | 'PAYMENT_GATEWAY'
  | 'LOYALTY_MARKETING'
  | 'SUPPLY_CHAIN'
  | 'AI_SPECIALIST'
  | 'HARDWARE_IOT';

export interface MarketplacePlugin {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  developerName: string;
  category: PluginCategory;
  version: string;
  ratingScore: number;
  reviewsCount: number;
  monthlyPriceSar: number;
  isVerified: boolean;
  requiredPermissions: string[];
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  iconName: string;
  installedTenantsCount: number;
  lifecycleStatus: 'GA' | 'BETA' | 'DEPRECATED';
  sdkHooksSupported: string[];
}

export interface TenantInstalledPlugin {
  installationId: string;
  tenantId: string;
  pluginId: string;
  installedVersion: string;
  installedAt: string;
  enabled: boolean;
  apiKeyMasked: string;
  webhookUrl?: string;
  configuration: Record<string, any>;
  lastHealthCheckStatus: 'HEALTHY' | 'WARNING' | 'ERROR';
  lastHealthCheckTime: string;
}

// ----------------------------------------------------------------------------
// 4. WHITE LABEL & BRANDING TYPES
// ----------------------------------------------------------------------------

export interface WhiteLabelConfig {
  tenantId: string;
  brandName: string;
  portalTitleAr: string;
  portalTitleEn: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  customDomain: string;
  customDomainStatus: 'VERIFIED_SSL_ACTIVE' | 'DNS_PROPAGATING' | 'UNVERIFIED';
  dnsRecordsRequired: {
    type: 'CNAME' | 'TXT';
    host: string;
    value: string;
    status: 'ACTIVE' | 'PENDING';
  }[];
  themeEngine: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    borderRadiusPx: number;
    fontFamily: string;
    customCssVariables?: Record<string, string>;
  };
  emailBranding: {
    senderName: string;
    senderEmail: string;
    smtpConfigured: boolean;
    dkimStatus: 'VALID' | 'PENDING';
    headerHtmlAr: string;
    headerHtmlEn: string;
  };
  mobileBranding: {
    appName: string;
    splashScreenBgColor: string;
    iosBundleId: string;
    androidPackageName: string;
    pwaShortName: string;
  };
}

// ----------------------------------------------------------------------------
// 5. GLOBAL INFRASTRUCTURE & MULTI-REGION TYPES
// ----------------------------------------------------------------------------

export interface RegionClusterStatus {
  regionId: string;
  regionName: string;
  city: string;
  country: string;
  isPrimary: boolean;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILOVER_ACTIVE';
  latencyMs: number;
  activeNodesCount: number;
  cpuUtilizationPct: number;
  memoryUtilizationPct: number;
  replicationLagMs: number;
  databaseRole: 'PRIMARY_RW' | 'READ_REPLICA' | 'HOT_STANDBY';
  edgePoPsCount: number;
}

export interface GlobalTrafficRoute {
  sourceRegion: string;
  targetClusterId: string;
  routingPolicy: 'GEO_PROXIMITY' | 'LOWEST_LATENCY' | 'FAILOVER_OVERRIDE';
  trafficWeightPct: number;
  healthProbeSuccessRatePct: number;
}

// ----------------------------------------------------------------------------
// 6. ENTERPRISE DEVOPS & IAC TYPES
// ----------------------------------------------------------------------------

export interface GitOpsPipelineStatus {
  pipelineId: string;
  repository: string;
  branch: string;
  targetEnvironment: 'PRODUCTION' | 'STAGING' | 'DR_HOT_STANDBY';
  syncStatus: 'SYNCED' | 'OUT_OF_SYNC' | 'PROGRESSING';
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNKNOWN';
  lastCommitSha: string;
  lastCommitMessage: string;
  lastSyncTimestamp: string;
  automatedRollbackEnabled: boolean;
  canaryWeightPct: number;
  activeCrds: {
    crdKind: 'OmniTenant' | 'OmniBranch' | 'ZatcaGateway' | 'PosMeshNode';
    activeInstancesCount: number;
  }[];
}

export interface HelmReleaseInfo {
  chartName: string;
  chartVersion: string;
  appVersion: string;
  namespace: string;
  status: 'DEPLOYED' | 'PENDING_UPGRADE' | 'FAILED';
  replicasRunning: number;
  replicasDesired: number;
  hpaMinReplicas: number;
  hpaMaxReplicas: number;
  currentCpuUsagePct: number;
}

// ----------------------------------------------------------------------------
// 7. ENTERPRISE SECURITY & COMPLIANCE TYPES
// ----------------------------------------------------------------------------

export interface ComplianceControlItem {
  id: string;
  framework: 'SOC2_TYPE_II' | 'ISO_27001' | 'PCI_DSS_V4' | 'SAUDI_NDMO_PDPL';
  controlNumber: string;
  category: string;
  title: string;
  status: 'COMPLIANT' | 'AUDITED_PASSED' | 'IN_REVIEW' | 'ACTION_REQUIRED';
  lastAuditedDate: string;
  automatedCheck: boolean;
  evidenceReference: string;
  remediationAction?: string;
}

export interface SecurityAuditReport {
  overallScorePct: number;
  soc2ReadinessPct: number;
  iso27001ReadinessPct: number;
  pciDssCompliancePct: number;
  saudiPdplCompliancePct: number;
  totalControlsEvaluated: number;
  controlsPassingCount: number;
  openFindingsCount: number;
  nextAuditScheduled: string;
  certifiedAuditorSignoff: string;
}

// ----------------------------------------------------------------------------
// 8. COMMERCIAL PLATFORM & REVENUE TYPES
// ----------------------------------------------------------------------------

export interface CommercialMetrics {
  mrrSar: number;
  arrSar: number;
  nrrPct: number; // Net Revenue Retention
  arpuSar: number; // Average Revenue Per User
  activePaidTenantsCount: number;
  trialTenantsCount: number;
  churnRatePct: number;
  grossMarginPct: number;
  monthlyCloudCogsSar: number;
  monthlyAiCogsSar: number;
  expansionRevenueThisMonthSar: number;
  topTenantsByRevenue: {
    tenantId: string;
    name: string;
    branchesCount: number;
    mrrSar: number;
    tier: SubscriptionPlanTier;
  }[];
}

// ----------------------------------------------------------------------------
// 9. ENTERPRISE INSTALLER & DEPLOYMENT TYPES
// ----------------------------------------------------------------------------

export type DeploymentTarget = 'CLOUD_MULTI_TENANT' | 'ON_PREMISE_AIR_GAPPED' | 'HYBRID_EDGE_APPLIANCE';

export interface EnterpriseInstallerState {
  target: DeploymentTarget;
  wizardStep: 'PRE_FLIGHT_CHECKS' | 'INFRA_PROVISION' | 'DATABASE_BOOTSTRAP' | 'LICENSE_ACTIVATION' | 'ADMIN_SETUP' | 'COMPLETED';
  prerequisites: {
    name: string;
    required: string;
    detected: string;
    passed: boolean;
  }[];
  clusterConfig: {
    clusterName: string;
    kubernetesVersion: string;
    nodesCount: number;
    storageClass: string;
    networkCni: string;
  };
  installationProgressPct: number;
  upgradeManager: {
    currentInstalledVersion: string;
    latestAvailableVersion: string;
    isUpgradeAvailable: boolean;
    zeroDowntimeSupported: boolean;
    rollbackSnapshotAvailable: boolean;
  };
}

// ----------------------------------------------------------------------------
// 10. PRODUCTION CERTIFICATION TYPES
// ----------------------------------------------------------------------------

export interface ProductionCertificationReport {
  certificationId: string;
  releaseVersion: string;
  signoffDate: string;
  certifiedTier: 'ENTERPRISE_GRADE_AAA_PLUS';
  slaCommitmentPct: number;
  rpoSeconds: number;
  rtoSeconds: number;
  zatcaPhase2Compliance: '100% PRODUCTION VERIFIED';
  iso27001Certification: 'COMPLIANT & AUDITED';
  soc2TypeIIStatus: 'ATTESTATION COMPLETE';
  pciDssV4Readiness: 'LEVEL 1 COMPLIANT';
  automatedTestPassRatePct: number;
  totalAutomatedTestsCount: number;
  leadArchitectSignoff: string;
  securityOfficerSignoff: string;
  chiefProductOfficerSignoff: string;
}
