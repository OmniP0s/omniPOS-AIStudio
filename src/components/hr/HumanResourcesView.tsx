import React, { useState } from 'react';
import { Employee, AttendanceRecord, ShiftRosterItem, User } from '../../types';
import { globalPayrollEngine } from '../../domain/hr/payrollEngine';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  Download,
  Fingerprint,
  Scan,
  CheckCircle2,
  TrendingUp,
  Award,
  Plus,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface HumanResourcesViewProps {
  isArabic: boolean;
  activeUser: User;
}

export const HumanResourcesView: React.FC<HumanResourcesViewProps> = ({
  isArabic,
  activeUser,
}) => {
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ATTENDANCE' | 'ROSTER' | 'TIPS_POOL' | 'WPS_PAYROLL'>('EMPLOYEES');
  const [employees, setEmployees] = useState<Employee[]>(() => globalPayrollEngine.getEmployees());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => globalPayrollEngine.getAttendance());
  const [roster, setRoster] = useState<ShiftRosterItem[]>(() => globalPayrollEngine.getRoster());

  // Biometric Clock-in simulation state
  const [clockInEmpId, setClockInEmpId] = useState<string>('emp-01');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);

  // Tips Distribution state
  const [tipsTotal, setTipsTotal] = useState<number>(1250);
  const [tipsMethod, setTipsMethod] = useState<'HOURS_WORKED' | 'POINTS_BY_ROLE' | 'EQUAL_SPLIT'>('HOURS_WORKED');

  const tipsCalculation = globalPayrollEngine.distributeTips('shift-today', 'SH-2026-0827', tipsTotal, tipsMethod);

  const handleSimulateClockIn = (method: 'FACE_ID' | 'FINGERPRINT') => {
    setIsScanning(true);
    setScanSuccessMsg(null);

    setTimeout(() => {
      const record = globalPayrollEngine.recordBiometricClockIn(clockInEmpId, method);
      setAttendance([...globalPayrollEngine.getAttendance()]);
      setIsScanning(false);
      setScanSuccessMsg(`Biometric ${method} verified! Clocked in at ${record.clockIn}`);
    }, 1200);
  };

  const handleDownloadWpsFile = () => {
    const csvContent = globalPayrollEngine.generateWpsPayrollFile();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WPS_Payroll_Mudad_SA_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {isArabic ? 'الموارد البشرية ونظام حماية الأجور (WPS)' : 'HR Workforce, Biometrics & Payroll Engine'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
              Mudad / GOSI Compliant
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'إدارة الموظفين، الحضور بالبصمة، وتوزيع الإكراميات' : 'Employee Rostering, Biometric Attendance & Tips Pool'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isArabic
              ? 'تسجيل الحضور بالبصمة والوجه، احتساب ساعات العمل الإضافية، توزيع إكراميات الورديات، وملفات الرواتب المعتمدة'
              : 'Biometric shift clock-in, tips pool allocation, shift rostering, and Saudi Wages Protection System (WPS) generation'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadWpsFile}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isArabic ? 'تصدير ملف حماية الأجور (WPS / Mudad)' : 'Export WPS Payroll CSV'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'EMPLOYEES', labelEn: 'Staff Directory', labelAr: 'دليل الكادر والموظفين', icon: Users },
          { id: 'ATTENDANCE', labelEn: 'Biometric Timeclock', labelAr: 'الحضور الذكي وساعة الدوام', icon: Fingerprint },
          { id: 'ROSTER', labelEn: 'Shift Rostering', labelAr: 'جدول الورديات والدوام', icon: Calendar },
          { id: 'TIPS_POOL', labelEn: 'Tips Pool Allocator', labelAr: 'قسمة الإكراميات (Tips Pool)', icon: DollarSign },
          { id: 'WPS_PAYROLL', labelEn: 'Saudi WPS & GOSI', labelAr: 'حماية الأجور والتأمينات (GOSI)', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: STAFF DIRECTORY */}
      {activeTab === 'EMPLOYEES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isArabic ? 'سجل الموظفين والأداء التشغيلي' : 'Active Staff & Productivity Metrics'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'كادر العمل والرواتب وسرعة خدمة الطاولات' : 'Staff roles, monthly base, rating, and avg table turn speed'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إضافة موظف' : 'Add Employee'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3 font-mono">National ID</th>
                  <th className="p-3 text-right rtl:text-left">Monthly Base (SAR)</th>
                  <th className="p-3 text-center">Rating</th>
                  <th className="p-3 text-center">Avg Turn Time</th>
                  <th className="p-3 text-center">Biometrics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {isArabic ? emp.nameAr : emp.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{emp.code}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{emp.branchName}</td>
                    <td className="p-3 font-mono text-slate-500">{emp.nationalId}</td>
                    <td className="p-3 text-right rtl:text-left font-mono font-bold text-slate-900 dark:text-white">
                      SAR {emp.monthlySalary.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-amber-500 flex items-center justify-center gap-1">
                        ★ {emp.performanceRating}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-300">
                      {emp.avgTurnTimeMins > 0 ? `${emp.avgTurnTimeMins} mins` : 'N/A'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Enrolled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BIOMETRIC TIMECLOCK */}
      {activeTab === 'ATTENDANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clock In Terminal */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Scan className="w-5 h-5 text-indigo-600" />
              {isArabic ? 'جهاز تسجيل الحضور البيومتري' : 'Biometric Terminal Simulation'}
            </h3>

            <div>
              <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-1">Select Employee</label>
              <select
                value={clockInEmpId}
                onChange={e => setClockInEmpId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nameEn} ({e.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-4 border border-slate-800">
              <div className="w-20 h-20 rounded-full mx-auto bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center relative">
                {isScanning ? (
                  <Scan className="w-10 h-10 text-indigo-400 animate-pulse" />
                ) : (
                  <Fingerprint className="w-10 h-10 text-indigo-400" />
                )}
              </div>

              {isScanning && (
                <span className="text-xs font-mono text-indigo-400 block animate-pulse">
                  Authenticating biometric vector...
                </span>
              )}

              {scanSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{scanSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  disabled={isScanning}
                  onClick={() => handleSimulateClockIn('FACE_ID')}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Scan className="w-4 h-4" /> Face ID
                </button>
                <button
                  disabled={isScanning}
                  onClick={() => handleSimulateClockIn('FINGERPRINT')}
                  className="p-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" /> Fingerprint
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? 'سجل الحضور والانصراف المباشر' : 'Today’s Biometric Clock Log'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Clock In</th>
                    <th className="p-3">Clock Out</th>
                    <th className="p-3">Method</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {attendance.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{att.employeeName}</td>
                      <td className="p-3 font-mono text-slate-500">{att.date}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{att.clockIn}</td>
                      <td className="p-3 font-mono text-slate-500">{att.clockOut || 'Active on Shift'}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{att.verificationMethod}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ROSTER */}
      {activeTab === 'ROSTER' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isArabic ? 'جدول توزيع الورديات والمناوبات الأسبوعية' : 'Weekly Shift Rostering & Scheduling'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'توزيع الصباح والمساء والإجازات الدورية' : 'Coverage management for Kitchen, Bar, and Front-of-House'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إضافة وردية' : 'Schedule Shift'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roster.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{item.employeeName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-black">
                      {item.shiftType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.role}</p>
                </div>
                <div className="text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {item.startTime} - {item.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: TIPS POOL */}
      {activeTab === 'TIPS_POOL' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'محرك قسمة وتوزيع الإكراميات (Tips Pool)' : 'Shift Tips Pool Distribution Engine'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'توزيع الإكراميات المحصلة بناءً على ساعات العمل أو نقاط الدور' : 'Fair tips allocation computed across active floor and kitchen staff'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block">Total Tips (SAR)</label>
                <input
                  type="number"
                  value={tipsTotal}
                  onChange={e => setTipsTotal(Number(e.target.value))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-xs w-28"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block">Method</label>
                <select
                  value={tipsMethod}
                  onChange={e => setTipsMethod(e.target.value as any)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-xs"
                >
                  <option value="HOURS_WORKED">By Hours Worked</option>
                  <option value="POINTS_BY_ROLE">By Role Points</option>
                  <option value="EQUAL_SPLIT">Equal Split</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Shift Hours</th>
                  <th className="p-3 text-right rtl:text-left">Allocated Share (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {tipsCalculation.allocations.map(alloc => (
                  <tr key={alloc.employeeId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{alloc.employeeName}</td>
                    <td className="p-3 text-slate-500">{alloc.role}</td>
                    <td className="p-3 font-mono">{alloc.hours} hrs</td>
                    <td className="p-3 text-right rtl:text-left font-mono font-black text-emerald-600 text-sm">
                      SAR {alloc.allocatedAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: WPS PAYROLL */}
      {activeTab === 'WPS_PAYROLL' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isArabic ? 'نظام حماية الأجور السعودي (WPS) ومنصة مدد' : 'Saudi Ministry of Human Resources (WPS Mudad)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic ? 'ملف الرواتب البنكي المعتمد مع خصومات التأمينات الاجتماعية (GOSI 9.75%)' : 'Official bank payroll SIF / CSV specification with statutory GOSI deductions'}
              </p>
            </div>
            <button
              onClick={handleDownloadWpsFile}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Mudad CSV
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre">
            {globalPayrollEngine.generateWpsPayrollFile()}
          </div>
        </div>
      )}
    </div>
  );
};
