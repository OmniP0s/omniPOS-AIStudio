/**
 * HR AI Engine (Pillar 6)
 * Fatigue-Aware Shift Planning, Attendance Anomaly Detector,
 * 360-Degree Employee Performance Insights, and Saudi Labor Law EOSG Explainer.
 */

import {
  AttendanceAnomaly,
  EmployeePerformanceInsight,
  EosgCalculationExplanation,
} from '../types';

export class HrAiEngine {
  /**
   * Detect attendance anomalies (e.g. chronic tardiness, overtime breaches, buddy punching signals)
   */
  public getAttendanceAnomalies(): AttendanceAnomaly[] {
    return [
      {
        employeeId: 'EMP-SA-1042',
        employeeName: 'Fahad Al-Subaie',
        role: 'Line Cook',
        branchName: 'Olaya Flagship, Riyadh',
        anomalyType: 'UNAUTHORIZED_OVERTIME',
        occurrenceCount: 4,
        riskLevel: 'MEDIUM',
        recommendedHrAction: 'Overtime triggered by closing shift deep-clean delays; review prep line shift handoff checklist.',
      },
      {
        employeeId: 'EMP-SA-1088',
        employeeName: 'Zaid Mansoor',
        role: 'Cashier / Host',
        branchName: 'Al-Nakheel Mall, Riyadh',
        anomalyType: 'CHRONIC_TARDINESS',
        occurrenceCount: 6,
        riskLevel: 'HIGH',
        recommendedHrAction: 'Clock-ins averaged 22 minutes past shift start on Friday lunch slots; initiate 1-on-1 coaching counseling.',
      },
      {
        employeeId: 'EMP-SA-1019',
        employeeName: 'Tariq Nabil',
        role: 'Barista',
        branchName: 'Corniche Waterfront, Jeddah',
        anomalyType: 'BUDDY_PUNCHING_SIGNAL',
        occurrenceCount: 2,
        riskLevel: 'LOW',
        recommendedHrAction: 'Simultaneous biometric NFC badge-in with adjacent teammate flagged for manager video review.',
      },
    ];
  }

  /**
   * 360-degree employee performance insights and retention risk modeling
   */
  public getEmployeePerformanceInsights(): EmployeePerformanceInsight[] {
    return [
      {
        employeeId: 'EMP-SA-1021',
        employeeName: 'Sara Al-Otaibi',
        role: 'Senior Head Server & VIP Captain',
        branchName: 'Olaya Flagship, Riyadh',
        speedOfServiceScore: 96,
        upsellSuccessRatePercent: 34.2, // Network average is 18.5%
        attendanceScore: 99,
        customerSatisfactionScore: 4.95,
        retentionRisk: 'LOW',
        strengths: ['High-margin beverage & dessert upselling', 'Guest relationship building', 'Exemplary punctuality'],
        coachingAreas: ['Ready for Assistant Floor Manager promotion assessment'],
      },
      {
        employeeId: 'EMP-SA-1045',
        employeeName: 'Ahmed Yaseen',
        role: 'Grill Chef de Partie',
        branchName: 'Olaya Flagship, Riyadh',
        speedOfServiceScore: 91,
        upsellSuccessRatePercent: 0, // Back of house
        attendanceScore: 94,
        customerSatisfactionScore: 4.80,
        retentionRisk: 'MEDIUM',
        strengths: ['Wagyu steak doneness precision (99.4% accuracy)', 'HACCP food safety adherence'],
        coachingAreas: ['Pacing during extreme 8:30 PM weekend rush waves'],
      },
      {
        employeeId: 'EMP-SA-1099',
        employeeName: 'Omar Barakat',
        role: 'Cashier & Drive-Thru Expediter',
        branchName: 'Al-Nakheel Mall, Riyadh',
        speedOfServiceScore: 82,
        upsellSuccessRatePercent: 12.0,
        attendanceScore: 88,
        customerSatisfactionScore: 4.30,
        retentionRisk: 'HIGH',
        strengths: ['Quick cash reconciliation at end of day'],
        coachingAreas: ['Needs coaching on upselling combos and reducing order entry hesitation'],
      },
    ];
  }

  /**
   * Calculate and explain Saudi Labor Law End-of-Service Gratuity (Article 84 & 85)
   */
  public explainEosgCalculation(
    yearsOfService: number = 4.5,
    lastSalarySar: number = 9000,
    terminationReason: 'RESIGNATION' | 'TERMINATION_WITHOUT_CAUSE' | 'ARTICLE_80_DISMISSAL' = 'RESIGNATION'
  ): EosgCalculationExplanation {
    // Saudi Labor Law:
    // First 5 years = 0.5 month salary per year
    // After 5 years = 1.0 month salary per year
    let baseGratuity = 0;
    if (yearsOfService <= 5) {
      baseGratuity = yearsOfService * (0.5 * lastSalarySar);
    } else {
      baseGratuity = 5 * (0.5 * lastSalarySar) + (yearsOfService - 5) * (1.0 * lastSalarySar);
    }

    let finalAmount = baseGratuity;
    let articleReference = 'Saudi Labor Law Article 84';

    if (terminationReason === 'RESIGNATION') {
      articleReference = 'Saudi Labor Law Article 85 (Resignation Entitlements)';
      if (yearsOfService < 2) {
        finalAmount = 0;
      } else if (yearsOfService >= 2 && yearsOfService < 5) {
        finalAmount = (1 / 3) * baseGratuity; // One third
      } else if (yearsOfService >= 5 && yearsOfService < 10) {
        finalAmount = (2 / 3) * baseGratuity; // Two thirds
      } else {
        finalAmount = baseGratuity; // Full
      }
    } else if (terminationReason === 'ARTICLE_80_DISMISSAL') {
      articleReference = 'Saudi Labor Law Article 80 (Gross Misconduct)';
      finalAmount = 0;
    }

    return {
      employeeName: 'Abdullah Al-Dossary',
      hireDate: '2022-03-01',
      terminationDate: '2026-08-31',
      yearsOfService,
      lastSalarySar,
      contractType: 'INDEFINITE',
      terminationReason,
      statutoryEosgAmountSar: Math.round(finalAmount),
      saudiLaborLawArticle: articleReference,
      plainTextExplanationAr: `بناءً على المادة 85 من نظام العمل السعودي: لخدمة مدتها ${yearsOfService} سنوات واستقالة الموظف (بين سنتين و5 سنوات)، يستحق الموظف ثلث المكافأة القانونية (1/3 × نصف الراتب لكل سنة) بإجمالي ${Math.round(finalAmount).toLocaleString()} ر.س.`,
      plainTextExplanationEn: `Under Saudi Labor Law Article 85: For ${yearsOfService} years of service ending via employee resignation (between 2 and 5 years), the worker is entitled to one-third (1/3) of the standard award (1/3 × half-month wage per year), resulting in ${Math.round(finalAmount).toLocaleString()} SAR.`,
    };
  }
}

export const hrAi = new HrAiEngine();
