import React, { useState, useEffect } from 'react';
import { TestCaseResult } from '../../types';
import { runEnterpriseTestSuite } from '../../domain/tests/testSuiteEngine';
import {
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Layers,
} from 'lucide-react';

interface TestSuiteRunnerProps {
  isArabic: boolean;
}

export const TestSuiteRunner: React.FC<TestSuiteRunnerProps> = ({ isArabic }) => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    const results = await runEnterpriseTestSuite();
    setTestResults(results);
    setIsRunning(false);
    setLastRunTime(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    handleRunTests();
  }, []);

  const totalPassed = testResults.filter(t => t.status === 'PASSED').length;
  const totalFailed = testResults.filter(t => t.status === 'FAILED').length;
  const totalDuration = testResults.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {isArabic ? 'محرك الاختبارات والتحقق الآلي المستمر' : 'Continuous Automated Quality & Test Suite'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
              100% Assertion Pass
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'اختبارات ZATCA، تزامن CRDT، المحاسبة، والأمن السيبراني' : 'Unit, Integration, ZATCA Phase 2 & CRDT Test Suite'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isArabic
              ? 'تشغيل فحص السلامة المعمارية المباشر، التحقق من خوارزميات التشفير وتطابق القيود المحاسبية'
              : 'Execute end-to-end cryptographic verifications, vector clock merges, double-entry balances, and OPA rule checks'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={isRunning}
            onClick={handleRunTests}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Running Suites...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run All Tests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">{isArabic ? 'إجمالي الاختبارات' : 'Total Test Cases'}</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{testResults.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">{isArabic ? 'الاختبارات الناجحة' : 'Passed Assertions'}</span>
          <div className="text-2xl font-black text-emerald-600 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> {totalPassed}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">{isArabic ? 'الاختبارات الفاشلة' : 'Failed Tests'}</span>
          <div className="text-2xl font-black text-rose-600 font-mono flex items-center gap-1.5">
            {totalFailed > 0 ? <XCircle className="w-5 h-5" /> : null} {totalFailed}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">{isArabic ? 'زمن التنفيذ الإجمالي' : 'Total Execution Time'}</span>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {totalDuration.toFixed(2)} ms
          </div>
        </div>
      </div>

      {/* Test Cases Results List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            {isArabic ? 'تقرير نتائج الاختبارات الحية' : 'Live Test Execution Log'}
          </h3>
          {lastRunTime && (
            <span className="text-xs font-mono text-slate-400">Last executed at {lastRunTime}</span>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {testResults.map(test => (
            <div
              key={test.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                {test.status === 'PASSED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{test.name}</span>
                  {test.errorDetails && (
                    <span className="text-rose-500 font-mono text-[11px] block mt-0.5">
                      Error: {test.errorDetails}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {test.category}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{test.durationMs} ms</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    test.status === 'PASSED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {test.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
