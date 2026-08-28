import { LucideIcon } from 'lucide-react';

export type BiDashboardRole =
  | 'CEO'
  | 'COO'
  | 'CFO'
  | 'REGIONAL_MANAGER'
  | 'BRANCH_MANAGER'
  | 'KITCHEN_LEAD'
  | 'CASHIER_LEAD'
  | 'FRANCHISE_OWNER'
  | 'OPERATIONS_DIRECTOR';

export interface KpiMetric {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'REVENUE' | 'COST' | 'EFFICIENCY' | 'CUSTOMER' | 'OPERATIONS';
  value: number;
  formattedValue: string;
  unit: string;
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  isPositive: boolean;
  target: number;
  sparkline: number[];
  descriptionEn: string;
  descriptionAr: string;
}

export interface DashboardViewConfig {
  id: BiDashboardRole;
  titleEn: string;
  titleAr: string;
  personaEn: string;
  personaAr: string;
  focusKpis: string[];
  recommendedCharts: string[];
  alertCount: number;
}

export interface ScheduledReport {
  id: string;
  nameEn: string;
  nameAr: string;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string[];
  format: 'PDF' | 'EXCEL' | 'CSV';
  lastRun: string;
  nextRun: string;
  status: 'ACTIVE' | 'PAUSED';
}

export interface BiFilterState {
  timeRange: 'TODAY' | 'YESTERDAY' | 'LAST_7D' | 'LAST_30D' | 'THIS_QUARTER' | 'YTD' | 'CUSTOM';
  selectedBranchId: string;
  selectedRegionId: string;
  selectedChannel: 'ALL' | 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'DRIVE_THRU' | 'CATERING';
  realtimeStreaming: boolean;
}
