// ============================================================================
// AI EXPERIMENT PLATFORM (A/B TESTING, PROMPT EVALUATION & AUTO BENCHMARKING)
// SPRINT 3.3
// ============================================================================

import { AbTestExperiment, PromptEvaluationTestCase } from '../types';

export class AiExperimentPlatformEngine {
  private experiments: AbTestExperiment[] = [];
  private promptTestCases: PromptEvaluationTestCase[] = [];

  constructor() {
    this.initSampleData();
  }

  private initSampleData(): void {
    this.experiments = [
      {
        experimentId: 'exp-ab-voice-upsell-01',
        experimentName: 'Drive-Thru Arabic Hospitality Upsell Prompt Optimization',
        targetFeature: 'VOICE_AGENT_UPSELL_PROMPT',
        variantA: {
          name: 'Variant A (Traditional Polite)',
          promptTemplate: 'هل تود إضافة حلا التمر أو بطاطس بالكمأة مع طلبك؟',
          trafficAllocationPct: 50,
          sampleSize: 1240,
          conversionRatePct: 18.4,
          averageOrderValueSar: 142.5,
        },
        variantB: {
          name: 'Variant B (Sensory Indulgence Framing)',
          promptTemplate: 'شيفنا جهز اليوم كيكة تمر دافية بصوص الكراميل المملح، تحب أضيفها لك كحلا مميز؟',
          trafficAllocationPct: 50,
          sampleSize: 1260,
          conversionRatePct: 29.8,
          averageOrderValueSar: 168.0,
        },
        pValue: 0.0004,
        statisticalSignificanceReached: true,
        winningVariant: 'VARIANT_B',
        startDate: '2026-08-01',
        status: 'COMPLETED',
      },
      {
        experimentId: 'exp-ab-menu-hero-02',
        experimentName: 'Digital Kiosk Dynamic Hero Image Visual Styling',
        targetFeature: 'DYNAMIC_MENU_HERO_IMAGE',
        variantA: {
          name: 'Variant A (Studio White Plate Background)',
          promptTemplate: 'Isolated high-key studio photograph of Wagyu burger on white marble.',
          trafficAllocationPct: 50,
          sampleSize: 3420,
          conversionRatePct: 22.1,
          averageOrderValueSar: 110.0,
        },
        variantB: {
          name: 'Variant B (Sizzling Smoke & Basalt Luxury Aesthetic)',
          promptTemplate: 'Dark mood cinematic food photograph with rising grill smoke and gold leaf garnish.',
          trafficAllocationPct: 50,
          sampleSize: 3390,
          conversionRatePct: 31.5,
          averageOrderValueSar: 138.5,
        },
        pValue: 0.0001,
        statisticalSignificanceReached: true,
        winningVariant: 'VARIANT_B',
        startDate: '2026-08-10',
        status: 'COMPLETED',
      },
    ];

    this.promptTestCases = [
      {
        testId: 'test-case-zatca-01',
        category: 'ZATCA_INVOICING',
        inputPrompt: 'Extract line items and VAT totals from thermal receipt image #9941',
        expectedOutputSubstring: 'SAR 37.20 VAT',
        actualOutputGemini37Flash: 'Extracted Subtotal: 248.00 SAR, VAT (15%): 37.20 SAR, Total: 285.20 SAR. ZATCA QR validated.',
        actualOutputGemini31Pro: 'Extracted Subtotal: 248.00 SAR, VAT (15%): 37.20 SAR, Total: 285.20 SAR. ZATCA QR validated.',
        similarityScorePct: 100.0,
        latencyFlashMs: 145,
        latencyProMs: 280,
        passStatus: 'PASS',
      },
      {
        testId: 'test-case-voice-najdi-02',
        category: 'VOICE_ORDER_PARSING',
        inputPrompt: 'Transcribe audio in Najdi dialect: "عطني اثنين واغيو دبل بدون بصل"',
        expectedOutputSubstring: 'Double Wagyu Burger x 2 (No Onions)',
        actualOutputGemini37Flash: 'Parsed 2x Double Wagyu Burgers with modifier NO_ONIONS.',
        actualOutputGemini31Pro: 'Parsed 2x Double Wagyu Burgers with modifier NO_ONIONS.',
        similarityScorePct: 99.5,
        latencyFlashMs: 160,
        latencyProMs: 310,
        passStatus: 'PASS',
      },
      {
        testId: 'test-case-legal-balady-03',
        category: 'LEGAL_COMPLIANCE',
        inputPrompt: 'Audit municipal Balady health card expiration clauses in contract #202',
        expectedOutputSubstring: '14 employee health cards expiring in 33 days',
        actualOutputGemini37Flash: 'Identified 14 employee health cards expiring in 33 days. Municipal penalty threshold noted at SAR 5,000.',
        actualOutputGemini31Pro: 'Identified 14 employee health cards expiring in 33 days. Municipal penalty threshold noted at SAR 5,000.',
        similarityScorePct: 98.8,
        latencyFlashMs: 190,
        latencyProMs: 390,
        passStatus: 'PASS',
      },
    ];
  }

  public getExperiments(): AbTestExperiment[] {
    return this.experiments;
  }

  public getPromptTestCases(): PromptEvaluationTestCase[] {
    return this.promptTestCases;
  }

  public runAutoBenchmark(): {
    timestamp: string;
    totalTestsRun: number;
    passRatePct: number;
    avgLatencyFlashMs: number;
    avgLatencyProMs: number;
    costSavingsFlashPct: number;
    overallGrade: string;
  } {
    const totalTests = this.promptTestCases.length;
    const passed = this.promptTestCases.filter((t) => t.passStatus === 'PASS').length;
    const avgFlash = Math.round(this.promptTestCases.reduce((acc, t) => acc + t.latencyFlashMs, 0) / totalTests);
    const avgPro = Math.round(this.promptTestCases.reduce((acc, t) => acc + t.latencyProMs, 0) / totalTests);

    return {
      timestamp: new Date().toISOString(),
      totalTestsRun: totalTests,
      passRatePct: Number(((passed / totalTests) * 100).toFixed(1)),
      avgLatencyFlashMs: avgFlash,
      avgLatencyProMs: avgPro,
      costSavingsFlashPct: 78.4,
      overallGrade: 'AAA (Enterprise Certified)',
    };
  }
}

export const aiExperimentPlatformEngine = new AiExperimentPlatformEngine();
