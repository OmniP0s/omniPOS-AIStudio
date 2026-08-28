export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  nameEn: string;
  nameAr: string;
  nationalIdOrIqama: string;
  nationality: string;
  jobTitleEn: string;
  jobTitleAr: string;
  department: 'OPERATIONS' | 'KITCHEN' | 'MANAGEMENT' | 'LOGISTICS' | 'HR_FINANCE';
  branchId: string;
  branchName: string;
  basicSalarySar: number;
  housingAllowanceSar: number;
  transportAllowanceSar: number;
  totalMonthlyPackageSar: number;
  joinDate: string;
  iqamaExpiryDate: string;
  passportExpiryDate: string;
  contractType: 'UNLIMITED' | 'FIXED_TERM';
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED';
  vacationBalanceDays: number;
  gosiRegistered: boolean;
  wpsCompliant: boolean;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicSalarySar: number;
  allowancesSar: number;
  overtimeHours: number;
  overtimeAmountSar: number;
  gosiDeductionSar: number;
  absenceDeductionsSar: number;
  netPayoutSar: number;
  wpsFileGenerated: boolean;
  status: 'PROCESSED' | 'PAID' | 'PENDING_APPROVAL';
}

export interface EndOfServiceCalculation {
  yearsOfService: number;
  terminationType: 'RESIGNATION' | 'EMPLOYER_TERMINATION' | 'END_OF_CONTRACT';
  lastMonthlyWageSar: number;
  statutoryGratuitySar: number;
  accruedLeavePayoutSar: number;
  totalSettlementSar: number;
  saudiLaborLawArticle: string;
}

export interface SelfServiceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'VACATION_REQUEST' | 'SALARY_CERTIFICATE' | 'EXPENSE_CLAIM' | 'DOCUMENT_RENEWAL';
  submittedDate: string;
  details: string;
  status: 'PENDING_MANAGER' | 'APPROVED' | 'REJECTED';
  approverComments?: string;
}
