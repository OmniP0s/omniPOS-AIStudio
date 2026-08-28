// HR, Biometric Attendance, Shift Rostering, Tips Pool & Saudi Payroll Engine
import { Employee, AttendanceRecord, ShiftRosterItem, TipsPoolDistribution } from '../../types';

export const initialEmployees: Employee[] = [
  {
    id: 'emp-01',
    code: 'EMP-101',
    nameEn: 'Fahad Al-Otaibi',
    nameAr: 'فهد العتيبي',
    role: 'SUPER_ADMIN',
    branchId: 'branch-01',
    branchName: 'Riyadh Olaya Flagship',
    hourlyRate: 65.00,
    monthlySalary: 14000.00,
    phone: '+966 50 111 2233',
    email: 'fahad@omnipos.sa',
    nationalId: '1088492019',
    joinDate: '2022-03-15',
    status: 'ACTIVE',
    biometricEnrolled: true,
    performanceRating: 4.9,
    avgTurnTimeMins: 22,
    totalSalesVolume: 142000,
  },
  {
    id: 'emp-02',
    code: 'EMP-102',
    nameEn: 'Chef Tariq Mansour',
    nameAr: 'الشيف طارق منصور',
    role: 'HEAD_CHEF',
    branchId: 'branch-01',
    branchName: 'Riyadh Olaya Flagship',
    hourlyRate: 50.00,
    monthlySalary: 11500.00,
    phone: '+966 55 444 8899',
    email: 'tariq.chef@omnipos.sa',
    nationalId: '2109483722',
    joinDate: '2023-01-10',
    status: 'ACTIVE',
    biometricEnrolled: true,
    performanceRating: 4.8,
    avgTurnTimeMins: 14,
    totalSalesVolume: 0,
  },
  {
    id: 'emp-03',
    code: 'EMP-103',
    nameEn: 'Sara Al-Ghamdi',
    nameAr: 'سارة الغامدي',
    role: 'CASHIER',
    branchId: 'branch-01',
    branchName: 'Riyadh Olaya Flagship',
    hourlyRate: 35.00,
    monthlySalary: 6500.00,
    phone: '+966 54 999 1122',
    email: 'sara.cashier@omnipos.sa',
    nationalId: '1093847291',
    joinDate: '2023-08-01',
    status: 'ACTIVE',
    biometricEnrolled: true,
    performanceRating: 4.7,
    avgTurnTimeMins: 18,
    totalSalesVolume: 96500,
  },
  {
    id: 'emp-04',
    code: 'EMP-104',
    nameEn: 'Zaid Al-Harbi',
    nameAr: 'زيد الحربي',
    role: 'SERVER',
    branchId: 'branch-01',
    branchName: 'Riyadh Olaya Flagship',
    hourlyRate: 30.00,
    monthlySalary: 5500.00,
    phone: '+966 56 333 7711',
    email: 'zaid.server@omnipos.sa',
    nationalId: '1074839201',
    joinDate: '2024-02-15',
    status: 'ACTIVE',
    biometricEnrolled: true,
    performanceRating: 4.6,
    avgTurnTimeMins: 26,
    totalSalesVolume: 68400,
  },
  {
    id: 'emp-05',
    code: 'EMP-105',
    nameEn: 'Nasser Al-Subaie',
    nameAr: 'ناصر السبيعي',
    role: 'INVENTORY_LEAD',
    branchId: 'branch-01',
    branchName: 'Riyadh Olaya Flagship',
    hourlyRate: 38.00,
    monthlySalary: 7200.00,
    phone: '+966 50 888 4422',
    email: 'nasser.inventory@omnipos.sa',
    nationalId: '1049283749',
    joinDate: '2023-11-20',
    status: 'ACTIVE',
    biometricEnrolled: true,
    performanceRating: 4.9,
    avgTurnTimeMins: 0,
    totalSalesVolume: 0,
  },
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-01',
    employeeId: 'emp-01',
    employeeName: 'Fahad Al-Otaibi',
    branchId: 'branch-01',
    date: '2026-08-27',
    clockIn: '08:45 AM',
    clockOut: '05:15 PM',
    breakDurationMins: 45,
    totalHours: 7.75,
    verificationMethod: 'FACE_ID',
    status: 'ON_TIME',
  },
  {
    id: 'att-02',
    employeeId: 'emp-02',
    employeeName: 'Chef Tariq Mansour',
    branchId: 'branch-01',
    date: '2026-08-27',
    clockIn: '09:00 AM',
    clockOut: '06:30 PM',
    breakDurationMins: 60,
    totalHours: 8.5,
    verificationMethod: 'FINGERPRINT',
    status: 'OVERTIME',
  },
  {
    id: 'att-03',
    employeeId: 'emp-03',
    employeeName: 'Sara Al-Ghamdi',
    branchId: 'branch-01',
    date: '2026-08-27',
    clockIn: '09:05 AM',
    clockOut: '05:00 PM',
    breakDurationMins: 30,
    totalHours: 7.4,
    verificationMethod: 'FACE_ID',
    status: 'ON_TIME',
  },
];

export const initialRoster: ShiftRosterItem[] = [
  { id: 'ros-01', employeeId: 'emp-01', employeeName: 'Fahad Al-Otaibi', role: 'General Manager', date: '2026-08-27', shiftType: 'MORNING', startTime: '09:00 AM', endTime: '05:00 PM' },
  { id: 'ros-02', employeeId: 'emp-02', employeeName: 'Chef Tariq Mansour', role: 'Head Chef', date: '2026-08-27', shiftType: 'MORNING', startTime: '09:00 AM', endTime: '06:00 PM' },
  { id: 'ros-03', employeeId: 'emp-03', employeeName: 'Sara Al-Ghamdi', role: 'Cashier Lead', date: '2026-08-27', shiftType: 'EVENING', startTime: '04:00 PM', endTime: '12:00 AM' },
  { id: 'ros-04', employeeId: 'emp-04', employeeName: 'Zaid Al-Harbi', role: 'Senior Waiter', date: '2026-08-27', shiftType: 'EVENING', startTime: '04:00 PM', endTime: '12:00 AM' },
];

export class PayrollEngine {
  private employees: Employee[] = [...initialEmployees];
  private attendance: AttendanceRecord[] = [...initialAttendanceRecords];
  private roster: ShiftRosterItem[] = [...initialRoster];

  public getEmployees(): Employee[] {
    return this.employees;
  }

  public getAttendance(): AttendanceRecord[] {
    return this.attendance;
  }

  public getRoster(): ShiftRosterItem[] {
    return this.roster;
  }

  // Clock-in / Clock-out Biometric Action
  public recordBiometricClockIn(employeeId: string, method: 'FACE_ID' | 'FINGERPRINT' | 'PIN_PAD' = 'FACE_ID'): AttendanceRecord {
    const emp = this.employees.find(e => e.id === employeeId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName: emp ? emp.nameEn : 'Staff Member',
      branchId: emp ? emp.branchId : 'branch-01',
      date: dateStr,
      clockIn: timeStr,
      breakDurationMins: 0,
      totalHours: 0,
      verificationMethod: method,
      status: 'ON_TIME',
    };

    this.attendance.unshift(record);
    return record;
  }

  // Calculate Tips Pool Distribution
  public distributeTips(
    shiftId: string,
    shiftNumber: string,
    totalTips: number,
    method: 'HOURS_WORKED' | 'POINTS_BY_ROLE' | 'EQUAL_SPLIT' = 'HOURS_WORKED'
  ): TipsPoolDistribution {
    const eligibleEmployees = this.employees.filter(e => e.role === 'SERVER' || e.role === 'CASHIER' || e.role === 'LINE_COOK' || e.role === 'HEAD_CHEF');
    const totalCount = eligibleEmployees.length || 1;

    let allocations = [];

    if (method === 'EQUAL_SPLIT') {
      const perPerson = Number((totalTips / totalCount).toFixed(2));
      allocations = eligibleEmployees.map(e => ({
        employeeId: e.id,
        employeeName: e.nameEn,
        role: e.role,
        hours: 8,
        allocatedAmount: perPerson,
      }));
    } else if (method === 'POINTS_BY_ROLE') {
      const roleWeights: Record<string, number> = {
        SERVER: 3,
        CASHIER: 2,
        LINE_COOK: 2,
        HEAD_CHEF: 1,
      };
      const totalPoints = eligibleEmployees.reduce((sum, e) => sum + (roleWeights[e.role] || 1), 0);
      allocations = eligibleEmployees.map(e => {
        const weight = roleWeights[e.role] || 1;
        const amount = Number(((totalTips * weight) / totalPoints).toFixed(2));
        return {
          employeeId: e.id,
          employeeName: e.nameEn,
          role: e.role,
          hours: 8,
          allocatedAmount: amount,
        };
      });
    } else {
      // Default: Hours Worked (Simulated 8h each with slight variation)
      const hoursMap: Record<string, number> = { 'emp-01': 8, 'emp-02': 8.5, 'emp-03': 8, 'emp-04': 7.5, 'emp-05': 8 };
      const totalHours = eligibleEmployees.reduce((sum, e) => sum + (hoursMap[e.id] || 8), 0);
      allocations = eligibleEmployees.map(e => {
        const hours = hoursMap[e.id] || 8;
        const amount = Number(((totalTips * hours) / totalHours).toFixed(2));
        return {
          employeeId: e.id,
          employeeName: e.nameEn,
          role: e.role,
          hours,
          allocatedAmount: amount,
        };
      });
    }

    return {
      id: `tips-dist-${Date.now()}`,
      shiftId,
      shiftNumber,
      totalTipsCollected: totalTips,
      distributionMethod: method,
      distributedDate: new Date().toISOString(),
      allocations,
    };
  }

  // Generate Saudi Wages Protection System (WPS / Mudad) Export CSV
  public generateWpsPayrollFile(): string {
    const headers = ['Employee_ID', 'National_ID', 'Employee_Name', 'Bank_IBAN', 'Basic_Salary_SAR', 'Housing_Allowance', 'Transport_Allowance', 'Deductions_GOSI', 'Net_Payable_SAR'];
    const rows = this.employees.map(e => {
      const basic = e.monthlySalary * 0.7;
      const housing = e.monthlySalary * 0.2;
      const transport = e.monthlySalary * 0.1;
      const gosi = e.monthlySalary * 0.0975; // Saudi GOSI employee share
      const net = e.monthlySalary - gosi;
      return [
        e.code,
        e.nationalId,
        `"${e.nameEn}"`,
        `SA44RJHI${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
        basic.toFixed(2),
        housing.toFixed(2),
        transport.toFixed(2),
        gosi.toFixed(2),
        net.toFixed(2),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const globalPayrollEngine = new PayrollEngine();
