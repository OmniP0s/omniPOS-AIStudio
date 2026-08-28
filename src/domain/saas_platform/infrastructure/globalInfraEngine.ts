// ============================================================================
// GLOBAL INFRASTRUCTURE: MULTI-REGION DEPLOYMENT & GEO ROUTING ENGINE
// ============================================================================

import { RegionClusterStatus, GlobalTrafficRoute } from '../types';

export class GlobalInfraEngine {
  private clusters: RegionClusterStatus[] = [];
  private trafficRoutes: GlobalTrafficRoute[] = [];

  constructor() {
    this.seedGlobalInfrastructure();
  }

  private seedGlobalInfrastructure(): void {
    this.clusters = [
      {
        regionId: 'me-central-1',
        regionName: 'Riyadh Primary Edge Datacenter (GCP / Oracle Cloud KSA)',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        isPrimary: true,
        status: 'HEALTHY',
        latencyMs: 8,
        activeNodesCount: 24,
        cpuUtilizationPct: 42,
        memoryUtilizationPct: 58,
        replicationLagMs: 0,
        databaseRole: 'PRIMARY_RW',
        edgePoPsCount: 6,
      },
      {
        regionId: 'me-south-1',
        regionName: 'Bahrain & Eastern Gulf Secondary Region (AWS me-south-1)',
        city: 'Manama',
        country: 'Bahrain',
        isPrimary: false,
        status: 'HEALTHY',
        latencyMs: 14,
        activeNodesCount: 16,
        cpuUtilizationPct: 35,
        memoryUtilizationPct: 48,
        replicationLagMs: 12,
        databaseRole: 'READ_REPLICA',
        edgePoPsCount: 4,
      },
      {
        regionId: 'eu-west-1',
        regionName: 'Europe Disaster Recovery & Cold Analytics (Dublin)',
        city: 'Dublin',
        country: 'Ireland',
        isPrimary: false,
        status: 'HEALTHY',
        latencyMs: 68,
        activeNodesCount: 12,
        cpuUtilizationPct: 28,
        memoryUtilizationPct: 40,
        replicationLagMs: 45,
        databaseRole: 'HOT_STANDBY',
        edgePoPsCount: 8,
      },
      {
        regionId: 'us-east-1',
        regionName: 'North America Global CDN & AI Inference Hub (Virginia)',
        city: 'Ashburn',
        country: 'United States',
        isPrimary: false,
        status: 'HEALTHY',
        latencyMs: 110,
        activeNodesCount: 18,
        cpuUtilizationPct: 38,
        memoryUtilizationPct: 52,
        replicationLagMs: 85,
        databaseRole: 'READ_REPLICA',
        edgePoPsCount: 14,
      },
    ];

    this.trafficRoutes = [
      {
        sourceRegion: 'GCC / Middle East (Saudi Arabia, UAE, Kuwait, Qatar, Oman, Bahrain)',
        targetClusterId: 'me-central-1',
        routingPolicy: 'LOWEST_LATENCY',
        trafficWeightPct: 85,
        healthProbeSuccessRatePct: 99.999,
      },
      {
        sourceRegion: 'Levant & North Africa (Egypt, Jordan, Lebanon)',
        targetClusterId: 'me-south-1',
        routingPolicy: 'GEO_PROXIMITY',
        trafficWeightPct: 10,
        healthProbeSuccessRatePct: 99.995,
      },
      {
        sourceRegion: 'Europe & International Webhooks',
        targetClusterId: 'eu-west-1',
        routingPolicy: 'GEO_PROXIMITY',
        trafficWeightPct: 5,
        healthProbeSuccessRatePct: 100.0,
      },
    ];
  }

  public getClusterStatuses(): RegionClusterStatus[] {
    return this.clusters;
  }

  public getTrafficRoutes(): GlobalTrafficRoute[] {
    return this.trafficRoutes;
  }

  public triggerRegionalFailover(failedRegionId: string, targetFailoverRegionId: string): { success: boolean; message: string; activePrimary: string } {
    const failed = this.clusters.find((c) => c.regionId === failedRegionId);
    const target = this.clusters.find((c) => c.regionId === targetFailoverRegionId);

    if (!failed || !target) {
      throw new Error('Region ID not found');
    }

    failed.status = 'FAILOVER_ACTIVE';
    failed.databaseRole = 'READ_REPLICA';
    failed.isPrimary = false;

    target.status = 'HEALTHY';
    target.databaseRole = 'PRIMARY_RW';
    target.isPrimary = true;

    // Reroute traffic weight
    this.trafficRoutes.forEach((route) => {
      if (route.targetClusterId === failedRegionId) {
        route.targetClusterId = targetFailoverRegionId;
        route.routingPolicy = 'FAILOVER_OVERRIDE';
      }
    });

    return {
      success: true,
      message: `Zero-Downtime Geo-Failover orchestrated: Traffic redirected to ${target.regionName} with RPO < 100ms`,
      activePrimary: target.regionId,
    };
  }
}

export const globalInfraEngine = new GlobalInfraEngine();
