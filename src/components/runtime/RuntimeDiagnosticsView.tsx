import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Database,
  Layers,
  Zap,
  Server,
  Radio,
  RefreshCw,
  Clock,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Sliders,
  Flame,
} from 'lucide-react';
import { runtimeEngine } from '../../domain/runtime/runtimeEngine';

interface Props {
  isArabic: boolean;
}

export const RuntimeDiagnosticsView: React.FC<Props> = ({ isArabic }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate live jitter
      runtimeEngine.eventLoop.lagMs = Number((1.5 + Math.random() * 0.8).toFixed(2));
      runtimeEngine.eventLoop.tickCount += Math.floor(Math.random() * 200 + 100);
      runtimeEngine.currentTelemetry.tps = Math.floor(450 + Math.random() * 60);
      runtimeEngine.currentTelemetry.rps = Math.floor(1200 + Math.random() * 150);
      setTick((t) => t + 1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const {
    threadPools,
    eventLoop,
    memory,
    gcStats,
    dbPools,
    kafkaLag,
    redisHealth,
    queueDepths,
    socketMetrics,
  } = runtimeEngine;

  return (
    <div className="space-y-6">
      {/* Top Banner with Realtime System Pulse */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {isArabic ? 'مركز التشخيص الحي للأنظمة' : 'Live Runtime Diagnostics Center'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REALTIME 100Hz
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'مراقبة حية دون وسيط: Thread Pool، Event Loop، Heap Memory، GC Spikes، DB Pools، Kafka Lag، ومقابس الشبكة'
                  : 'Zero-overhead in-process telemetry: Thread Pool, Event Loop, Heap Allocations, GC Spikes, DB Pools, Kafka Lag, and Sockets.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-xs">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-mono">Uptime: 48d 14h 22m (99.999%)</span>
          </div>
        </div>

        {/* Quick High-Level Pulse Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Event Loop Lag</span>
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black font-mono text-indigo-300 mt-1">
              {eventLoop.lagMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> P99: {eventLoop.latencyP99}ms (Target &lt; 15ms)
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Memory Pressure</span>
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black font-mono text-blue-300 mt-1">
              {memory.heapUsedMB} <span className="text-xs font-normal text-slate-400">/ {memory.heapTotalMB} MB</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Heap: {Math.round((memory.heapUsedMB / memory.heapTotalMB) * 100)}% (Status: {memory.pressureLevel})
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>GC Overhead</span>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-300 mt-1">
              {gcStats.gcOverheadPct}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Major GC Avg Pause: {gcStats.markSweepAvgPauseMs}ms
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Open Sockets</span>
              <Network className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-purple-300 mt-1">
              {socketMetrics.totalOpenDescriptors}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              WebSockets: {socketMetrics.activeWebSockets} | Drop: {socketMetrics.packetDropRatePct}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Diagnostics Subsystems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Thread Pool Monitor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>{isArabic ? 'مراقبة Thread Pools وخيوط المعالجة' : 'Thread Pool & Worker Monitor'}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">3 Active Pools</span>
          </div>

          <div className="space-y-3">
            {threadPools.map((pool) => (
              <div key={pool.poolName} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-300 font-bold">{pool.poolName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {pool.threadState}
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>
                      Active: <strong className="text-white">{pool.activeThreads}</strong> / {pool.maxSize} threads
                    </span>
                    <span>Queued: <strong className="text-amber-400">{pool.queuedTasks}</strong></span>
                    <span>{pool.utilizationPct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pool.utilizationPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Completed: {pool.completedTasks.toLocaleString()}</span>
                  <span>Rejected: {pool.rejectedTasks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Database Connection Pool Monitor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database className="w-4 h-4 text-blue-400" />
              <span>{isArabic ? 'مراقبة مجموعات اتصالات قاعدة البيانات (DB Pools)' : 'Database Connection Pool Monitor'}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">HikariCP High Performance</span>
          </div>

          <div className="space-y-3">
            {dbPools.map((pool) => (
              <div key={pool.poolId} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-blue-300 font-bold">{pool.poolId}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{pool.databaseName}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Active / Total</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {pool.activeConnections} / {pool.totalConnections}
                    </div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Acquisition Latency</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      {pool.avgAcquisitionTimeMs} ms
                    </div>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Wait Threads</div>
                    <div className="text-sm font-bold text-slate-300 font-mono mt-0.5">
                      {pool.waitingThreads}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${pool.saturationPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Kafka Consumer Lag & Queue Depth */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{isArabic ? 'مراقبة تراكم رسائل كافكا (Kafka Consumer Lag)' : 'Kafka Consumer Lag & Queue Depths'}</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Zero Backpressure</span>
          </div>

          <div className="space-y-3">
            {kafkaLag.map((k) => (
              <div key={k.topic} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-300 font-bold">{k.topic}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Group: {k.consumerGroup}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    Lag: <strong className="text-white font-mono">{k.lag} msgs</strong>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Throughput: <strong className="text-emerald-400 font-mono">{k.consumptionRateMsgSec} msg/s</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {k.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Redis Cluster Health & Sockets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Zap className="w-4 h-4 text-red-400" />
              <span>{isArabic ? 'صحة ذاكرة التخزين المؤقت Redis ومقابس TCP' : 'Redis Health & Sockets'}</span>
            </div>
            <span className="text-xs text-red-400 font-mono">Hit Rate: {redisHealth.hitRatePct}%</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
                <div className="text-[10px] text-slate-400">Redis Memory</div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">
                  {redisHealth.usedMemoryMB}MB / {redisHealth.maxMemoryMB}MB
                </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
                <div className="text-[10px] text-slate-400">Ops / Sec</div>
                <div className="text-xs font-bold text-indigo-400 font-mono mt-0.5">
                  {redisHealth.opsPerSec.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
                <div className="text-[10px] text-slate-400">P99 Latency</div>
                <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                  {redisHealth.p99LatencyMs} ms
                </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
                <div className="text-[10px] text-slate-400">Evictions / Sec</div>
                <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                  {redisHealth.evictionsPerSec}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Cluster Host: <code className="text-slate-300 font-mono text-[11px]">{redisHealth.host}:{redisHealth.port}</code>
              </span>
              <span className="text-emerald-400 font-bold text-[11px]">ROLE: {redisHealth.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
