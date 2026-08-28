// ============================================================================
// VIDEO INTELLIGENCE & SPATIAL TELEMETRY ENGINE (CCTV, QUEUES, HEATMAPS)
// SPRINT 3.3
// ============================================================================

import { CctvSecurityEvent, QueueTelemetry, SpatialHeatmapZone } from '../types';

export class VideoIntelligenceEngine {
  private events: CctvSecurityEvent[] = [];

  constructor() {
    this.initSampleEvents();
  }

  private initSampleEvents(): void {
    this.events = [
      {
        eventId: 'cctv-evt-001',
        cameraLocation: 'DRIVE_THRU_LANE',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        eventType: 'QUEUE_SURGE',
        severity: 'WARNING',
        confidencePct: 98.2,
        automatedRemediationTaken: 'Alerted drive-thru window 2 and accelerated KDS prioritization.',
      },
      {
        eventId: 'cctv-evt-002',
        cameraLocation: 'CASH_REGISTER_1',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        eventType: 'CASH_DRAWER_OPEN_LONG',
        severity: 'INFO',
        confidencePct: 99.5,
        automatedRemediationTaken: 'Logged POS event #4412 with cashier cash reconciliation audit.',
      },
      {
        eventId: 'cctv-evt-003',
        cameraLocation: 'DINING_ZONE_1',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        eventType: 'TABLE_DWELL_LIMIT_EXCEEDED',
        severity: 'INFO',
        confidencePct: 96.0,
        automatedRemediationTaken: 'Prompted host tablet to check guest comfort at Table 12.',
      },
    ];
  }

  public getRecentEvents(): CctvSecurityEvent[] {
    return this.events;
  }

  public getQueueTelemetry(): QueueTelemetry[] {
    return [
      {
        zoneId: 'ZONE-DRIVE-THRU',
        zoneName: 'Olaya Drive-Thru Lane (Dual Window)',
        currentVehicleCount: 4,
        currentCustomerCount: 8,
        averageWaitTimeSeconds: 142,
        targetMaxWaitSeconds: 180,
        queueStatus: 'OPTIMAL',
        historicalHourlyTrend: [
          { hour: '12:00', avgWaitSec: 120, customerVolume: 32 },
          { hour: '13:00', avgWaitSec: 165, customerVolume: 58 },
          { hour: '14:00', avgWaitSec: 195, customerVolume: 74 },
          { hour: '15:00', avgWaitSec: 140, customerVolume: 42 },
          { hour: '16:00', avgWaitSec: 110, customerVolume: 28 },
        ],
      },
      {
        zoneId: 'ZONE-CASHIER-MAIN',
        zoneName: 'Main Counter & Self-Order Kiosks',
        currentCustomerCount: 6,
        averageWaitTimeSeconds: 85,
        targetMaxWaitSeconds: 120,
        queueStatus: 'OPTIMAL',
        historicalHourlyTrend: [
          { hour: '12:00', avgWaitSec: 60, customerVolume: 45 },
          { hour: '13:00', avgWaitSec: 95, customerVolume: 82 },
          { hour: '14:00', avgWaitSec: 115, customerVolume: 96 },
          { hour: '15:00', avgWaitSec: 80, customerVolume: 55 },
          { hour: '16:00', avgWaitSec: 50, customerVolume: 35 },
        ],
      },
      {
        zoneId: 'ZONE-DELIVERY-PICKUP',
        zoneName: 'Online Delivery Couriers (Jahez / HungerStation)',
        currentCustomerCount: 3,
        averageWaitTimeSeconds: 190,
        targetMaxWaitSeconds: 240,
        queueStatus: 'OPTIMAL',
        historicalHourlyTrend: [
          { hour: '12:00', avgWaitSec: 150, customerVolume: 60 },
          { hour: '13:00', avgWaitSec: 210, customerVolume: 110 },
          { hour: '14:00', avgWaitSec: 230, customerVolume: 125 },
          { hour: '15:00', avgWaitSec: 170, customerVolume: 70 },
          { hour: '16:00', avgWaitSec: 130, customerVolume: 45 },
        ],
      },
    ];
  }

  public getSpatialHeatmapZones(): SpatialHeatmapZone[] {
    return [
      {
        zoneId: 'HEAT-ZONE-ENTRANCE',
        zoneLabel: 'Entrance & Host Stand',
        coordinates: { x: 20, y: 30, width: 140, height: 100 },
        currentDwellTimeMinutes: 2.1,
        trafficDensityPct: 68,
        bottleneckDetected: false,
      },
      {
        zoneId: 'HEAT-ZONE-KIOSKS',
        zoneLabel: 'Self-Service Digital Kiosks',
        coordinates: { x: 180, y: 30, width: 160, height: 100 },
        currentDwellTimeMinutes: 3.8,
        trafficDensityPct: 84,
        bottleneckDetected: false,
      },
      {
        zoneId: 'HEAT-ZONE-MAIN-DINING',
        zoneLabel: 'Central Banquette Dining Area',
        coordinates: { x: 20, y: 150, width: 320, height: 220 },
        currentDwellTimeMinutes: 48.5,
        trafficDensityPct: 92,
        bottleneckDetected: false,
      },
      {
        zoneId: 'HEAT-ZONE-VIP-LOUNGE',
        zoneLabel: 'Private VIP Dining Booths',
        coordinates: { x: 360, y: 150, width: 180, height: 220 },
        currentDwellTimeMinutes: 65.0,
        trafficDensityPct: 75,
        bottleneckDetected: false,
      },
      {
        zoneId: 'HEAT-ZONE-DRIVE-THRU-WINDOW',
        zoneLabel: 'Drive-Thru Dispatch Window',
        coordinates: { x: 360, y: 30, width: 180, height: 100 },
        currentDwellTimeMinutes: 2.4,
        trafficDensityPct: 79,
        bottleneckDetected: false,
      },
    ];
  }
}

export const videoIntelligenceEngine = new VideoIntelligenceEngine();
