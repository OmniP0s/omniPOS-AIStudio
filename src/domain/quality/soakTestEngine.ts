import { SoakTestMetrics, MassiveScaleMetrics } from './types';

export const INITIAL_SOAK_TEST: SoakTestMetrics = {
  durationDays: 14.6,
  targetDays: 30,
  status: 'RUNNING',
  startTime: '2026-08-12T00:00:00Z',
  uptimePercentage: 99.999,
  totalOrdersProcessed: 68420950,
  memoryRssMb: 768.4,
  memoryHeapUsedMb: 382.1,
  heapGrowthSlope: 0.04, // 0.04 MB/day -> effectively zero leak
  leakDetected: false,
  activeThreads: 48,
  threadStabilityScore: 99.8,
  queueDepthRedis: 4,
  queueDepthKafka: 12,
  queueStabilityScore: 99.9,
  gcPauseAverageMs: 1.8,
  openFileDescriptors: 214,
  timeSeries: [
    { timestamp: 'Day 1', rss: 750, heap: 360, threads: 45, queue: 8 },
    { timestamp: 'Day 3', rss: 758, heap: 372, threads: 48, queue: 10 },
    { timestamp: 'Day 6', rss: 762, heap: 378, threads: 46, queue: 6 },
    { timestamp: 'Day 9', rss: 765, heap: 380, threads: 48, queue: 14 },
    { timestamp: 'Day 12', rss: 766, heap: 381, threads: 47, queue: 9 },
    { timestamp: 'Day 15', rss: 768, heap: 382, threads: 48, queue: 4 },
  ],
};

export const INITIAL_MASSIVE_SCALE_METRICS: MassiveScaleMetrics = {
  targetBranches: 10000,
  targetDevices: 100000,
  targetOrdersPerDay: 5000000,
  targetConcurrentKitchens: 25000,
  simulatedCustomers: 12500000,
  currentTps: 3450,
  peakTpsAchieved: 8920,
  p50LatencyMs: 12.4,
  p95LatencyMs: 44.8,
  p99LatencyMs: 98.2,
  errorRatePercent: 0.0004,
  cpuSaturationPercent: 38.4,
  dbPoolSaturationPercent: 42.1,
  networkThroughputGbps: 4.82,
  status: 'ACTIVE_STRESS',
  activeBottleneck: null,
};
