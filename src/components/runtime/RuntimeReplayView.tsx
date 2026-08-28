import React, { useState } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowRight,
  GitBranch,
  Search,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';
import { ReplayEvent } from '../../domain/runtime/types';

interface Props {
  isArabic: boolean;
}

export const RuntimeReplayView: React.FC<Props> = ({ isArabic }) => {
  const scenario = runtimeEngine.replayScenarios[0];
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentEvent: ReplayEvent | undefined = scenario.events[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < scenario.events.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handlePlayToggle = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      let step = currentStepIndex;
      const interval = setInterval(() => {
        step++;
        if (step < scenario.events.length) {
          setCurrentStepIndex(step);
        } else {
          setIsPlaying(false);
          clearInterval(interval);
        }
      }, 1500);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'محرك إعادة التشغيل وتتبع الخطوات (Runtime Replay Engine)' : 'Runtime Flight Recorder & Replay Engine'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  DETERMINISTIC TIME-TRAVEL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'تسجيل دقيق وإعادة تشغيل لأي سيناريو: طلبات الـ API، الأحداث، رسائل Kafka، خطوات الـ Saga، ومسار التدقيق لاكتشاف الأخطاء بدقة متناهية'
                  : 'Deterministic flight recorder capturing API requests, domain events, Kafka messages, distributed Saga steps, and audit logs.'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Scenario Header & Player Controls */}
        <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">Active Recorded Scenario:</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {isArabic ? scenario.nameAr : scenario.nameEn}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{scenario.description}</div>
          </div>

          {/* Time-Travel Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayToggle}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Replay Scenario'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === scenario.events.length - 1}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Replay Stepper Timeline & Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-white font-bold text-sm">
              {isArabic ? 'الخطوات المسجلة بالترتيب الزمني' : 'Recorded Event Timeline'}
            </div>
            <span className="text-xs text-indigo-400 font-mono">
              Step {currentStepIndex + 1} of {scenario.events.length}
            </span>
          </div>

          <div className="space-y-2">
            {scenario.events.map((ev, idx) => (
              <button
                key={ev.stepIndex}
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  idx === currentStepIndex
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-80'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5 ${
                    idx === currentStepIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ev.stepIndex}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.2 rounded text-[9px] font-bold font-mono bg-slate-900 text-slate-300 border border-slate-800">
                      {ev.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{ev.timestamp}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-1">{ev.action}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{ev.source}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Deep Payload Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="text-white font-bold text-sm">
              {isArabic ? 'فاحص حمولة البيانات والحالة (State Payload Inspector)' : 'State & Payload Inspector'}
            </div>
            <span className="text-xs text-emerald-400 font-mono">Status: {currentEvent?.status}</span>
          </div>

          {currentEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Event Type</div>
                  <div className="font-mono font-bold text-indigo-400 mt-0.5">{currentEvent.type}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Duration</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">{currentEvent.durationMs} ms</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <div className="text-[10px] text-slate-400">Origin / Component</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 truncate">{currentEvent.source}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">Immutable JSON Payload Snapshot:</div>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                  {JSON.stringify(currentEvent.payload, null, 2)}
                </pre>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                <strong className="text-white">Time-Travel Debugger Note:</strong> This exact state mutation was reconstructed from the distributed outbox WAL stream and Kafka partition log.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
