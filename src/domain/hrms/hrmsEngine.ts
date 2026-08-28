import { EmployeeProfile, PayrollRecord, EndOfServiceCalculation, SelfServiceRequest } from './types';

export const ENTERPRISE_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'EMP-1001',
    employeeCode: 'EMP-1001',
    nameEn: 'Tariq Al-Mansoor',
    nameAr: 'طارق المنصور',
    nationalIdOrIqama: '1084920194',
    nationality: 'Saudi Arabia',
    jobTitleEn: 'Executive Head Chef',
    jobTitleAr: 'رئيس الطهاة التنفيذي',
    department: 'KITCHEN',
    branchId: 'BR-01',
    branchName: 'Riyadh Central Commissary',
    basicSalarySar: 16000,
    housingAllowanceSar: 4000,
    transportAllowanceSar: 2000,
    totalMonthlyPackageSar: 22000,
    joinDate: '2021-03-01',
    iqamaExpiryDate: '2030-01-01',
    passportExpiryDate: '2029-05-15',
    contractType: 'UNLIMITED',
    status: 'ACTIVE',
    vacationBalanceDays: 24,
    gosiRegistered: true,
    wpsCompliant: true,
  },
  {
    id: 'EMP-1002',
    employeeCode: 'EMP-1002',
    nameEn: 'Rahul Dev Sharma',
    nameAr: 'راهول ديف شارما',
    nationalIdOrIqama: '2491029481',
    nationality: 'India',
    jobTitleEn: 'Senior Line Chef & Expediter',
    jobTitleAr: 'طاهي خط إنتاج أول ومسؤول الترحيل',
    department: 'KITCHEN',
    branchId: 'BR-02',
    branchName: 'Olaya Flagship Branch',
    basicSalarySar: 5500,
    housingAllowanceSar: 1500,
    transportAllowanceSar: 500,
    totalMonthlyPackageSar: 7500,
    joinDate: '2022-06-15',
    iqamaExpiryDate: '2027-04-10',
    passportExpiryDate: '2028-11-20',
    contractType: 'FIXED_TERM',
    status: 'ACTIVE',
    vacationBalanceDays: 18,
    gosiRegistered: true,
    wpsCompliant: true,
  },
  {
    id: 'EMP-1003',
    employeeCode: 'EMP-1003',
    nameEn: 'Sara Al-Ghamdi',
    nameAr: 'سارة الغامدي',
    nationalIdOrIqama: '1092049182',
    nationality: 'Saudi Arabia',
    jobTitleEn: 'Front-of-House Supervisor & Lead Cashier',
    jobTitleAr: 'مشرفة الصالة ورئيسة الكاشيرات',
    department: 'OPERATIONS',
    branchId: 'BR-02',
    branchName: 'Olaya Flagship Branch',
    basicSalarySar: 7000,
    housingAllowanceSar: 1750,
    transportAllowanceSar: 750,
    totalMonthlyPackageSar: 9500,
    joinDate: '2023-01-10',
    iqamaExpiryDate: '2030-01-01',
    passportExpiryDate: '2030-01-01',
    contractType: 'UNLIMITED',
    status: 'ACTIVE',
    vacationBalanceDays: 21,
    gosiRegistered: true,
    wpsCompliant: true,
  },
  {
    id: 'EMP-1004',
    employeeCode: 'EMP-1004',
    nameEn: 'Michael Santos',
    nameAr: 'مايكل سانتوس',
    nationalIdOrIqama: '2398401923',
    nationality: 'Philippines',
    jobTitleEn: 'Fleet Cold-Chain Delivery Captain',
    jobTitleAr: 'قائد أسطول التوصيل المبرد',
    department: 'LOGISTICS',
    branchId: 'BR-03',
    branchName: 'Red Sea Mall Branch',
    basicSalarySar: 4200,
    housingAllowanceSar: 1200,
    transportAllowanceSar: 600,
    totalMonthlyPackageSar: 6000,
    joinDate: '2023-08-01',
    iqamaExpiryDate: '2027-02-18',
    passportExpiryDate: '2028-09-12',
    contractType: 'FIXED_TERM',
    status: 'ACTIVE',
    vacationBalanceDays: 14,
    gosiRegistered: true,
    wpsCompliant: true,
  },
];

export const CURRENT_PAYROLL_BATCH: PayrollRecord[] = [
  {
    id: 'PAY-2026-08',
    employeeId: 'EMP-1001',
    employeeName: 'Tariq Al-Mansoor',
    month: 'August 2026',
    basicSalarySar: 16000,
    allowancesSar: 6000,
    overtimeHours: 8,
    overtimeAmountSar: 1100,
    gosiDeductionSar: 1950,
    absenceDeductionsSar: 0,
    netPayoutSar: 21150,
    wpsFileGenerated: true,
    status: 'PROCESSED',
  },
  {
    id: 'PAY-2026-08',
    employeeId: 'EMP-1002',
    employeeName: 'Rahul Dev Sharma',
    month: 'August 2026',
    basicSalarySar: 5500,
    allowancesSar: 2000,
    overtimeHours: 16,
    overtimeAmountSar: 780,
    gosiDeductionSar: 150,
    absenceDeductionsSar: 0,
    netPayoutSar: 8130,
    wpsFileGenerated: true,
    status: 'PROCESSED',
  },
];

export const HR_SELF_SERVICE_REQUESTS: SelfServiceRequest[] = [
  {
    id: 'REQ-01',
    employeeId: 'EMP-1003',
    employeeName: 'Sara Al-Ghamdi',
    type: 'VACATION_REQUEST',
    submittedDate: '2026-08-25',
    details: 'Annual leave request (7 days: Sep 10 - Sep 17, 2026)',
    status: 'APPROVED',
    approverComments: 'Approved by Branch Manager Sultan Al-Harbi',
  },
  {
    id: 'REQ-02',
    employeeId: 'EMP-1002',
    employeeName: 'Rahul Dev Sharma',
    type: 'SALARY_CERTIFICATE',
    submittedDate: '2026-08-26',
    details: 'Attested salary identification certificate for bank auto-financing',
    status: 'APPROVED',
    approverComments: 'Digitally signed and generated via HR seal',
  },
];

/**
 * Calculates End of Service Gratuity (EOSG) strictly under Saudi Labor Law Articles 84 and 85
 */
export function calculateSaudiEOSG(
  yearsOfService: number,
  lastWageSar: number,
  terminationType: 'RESIGNATION' | 'EMPLOYER_TERMINATION' | 'END_OF_CONTRACT',
  accruedLeaveDays: number
): EndOfServiceCalculation {
  let baseGratuity = 0;

  // Article 84: Half month wage for each of the first 5 years, full month wage for each year thereafter
  if (yearsOfService <= 5) {
    baseGratuity = yearsOfService * (lastWageSar / 2);
  } else {
    baseGratuity = 5 * (lastWageSar / 2) + (yearsOfService - 5) * lastWageSar;
  }

  let finalGratuity = baseGratuity;
  let saudiArticle = 'Article 84 (Full Entitlement)';

  // Article 85: Resignation scale
  if (terminationType === 'RESIGNATION') {
    if (yearsOfService < 2) {
      finalGratuity = 0;
      saudiArticle = 'Article 85 (Less than 2 years: 0%)';
    } else if (yearsOfService >= 2 && yearsOfService < 5) {
      finalGratuity = baseGratuity * (1 / 3);
      saudiArticle = 'Article 85 (2 to 5 years: 1/3 entitlement)';
    } else if (yearsOfService >= 5 && yearsOfService < 10) {
      finalGratuity = baseGratuity * (2 / 3);
      saudiArticle = 'Article 85 (5 to 10 years: 2/3 entitlement)';
    } else {
      finalGratuity = baseGratuity;
      saudiArticle = 'Article 85 (10+ years: 100% full entitlement)';
    }
  }

  const dailyWage = lastWageSar / 30;
  const accruedLeavePayout = accruedLeaveDays * dailyWage;
  const totalSettlement = finalGratuity + accruedLeavePayout;

  return {
    yearsOfService,
    terminationType,
    lastMonthlyWageSar: lastWageSar,
    statutoryGratuitySar: Math.round(finalGratuity * 100) / 100,
    accruedLeavePayoutSar: Math.round(accruedLeavePayout * 100) / 100,
    totalSettlementSar: Math.round(totalSettlement * 100) / 100,
    saudiLaborLawArticle: saudiArticle,
  };
}
