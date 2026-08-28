// ============================================================================
// DIGITAL TWIN SIMULATOR (BRANCH, KITCHEN, STAFF & SURGE MODELING)
// SPRINT 3.3
// ============================================================================

import { DigitalTwinSimulationConfig, DigitalTwinSimulationResult } from '../types';

export class DigitalTwinEngine {
  public runSimulation(config: DigitalTwinSimulationConfig): DigitalTwinSimulationResult {
    const surgeMultipliers: Record<string, number> = {
      BASELINE_NORMAL: 1.0,
      FRIDAY_DINNER_SPIKE: 1.85,
      RAMADAN_IFTAR_RUSH: 2.60,
      NATIONAL_DAY_EXTREME: 3.20,
    };

    const multiplier = surgeMultipliers[config.surgeScenario] || 1.0;
    const effectiveArrivalRate = config.customerArrivalRatePerHour * multiplier;
    const maxCapacityPerHour = config.kitchenThroughputOrdersPerHour * (config.activeKitchenStations / 4);

    const isOverloaded = effectiveArrivalRate > maxCapacityPerHour;
    const loadFactor = effectiveArrivalRate / Math.max(maxCapacityPerHour, 1);

    const totalCustomersServed = Math.round(Math.min(effectiveArrivalRate, maxCapacityPerHour) * config.simulationHours);
    const averageTableDwellMinutes = Number((38.0 + (loadFactor > 1.2 ? 18.0 : loadFactor * 5.0)).toFixed(1));
    const averageKdsTicketTimeMinutes = Number((6.5 + (isOverloaded ? (loadFactor - 1.0) * 12.0 : 0.5)).toFixed(1));
    const maximumQueueLength = Math.round(isOverloaded ? (effectiveArrivalRate - maxCapacityPerHour) * 0.8 : Math.max(3, effectiveArrivalRate * 0.08));

    const avgSpendPerCustomerSar = 115.0;
    const projectedRevenueSar = Number((totalCustomersServed * avgSpendPerCustomerSar).toFixed(2));
    const potentialLostRevenueSar = isOverloaded
      ? Number(((effectiveArrivalRate * config.simulationHours - totalCustomersServed) * avgSpendPerCustomerSar).toFixed(2))
      : 0;

    const staffUtilizationPct = Number(Math.min(99.0, 65.0 + loadFactor * 25.0).toFixed(1));

    // Minute by minute trajectory
    const minuteByMinuteTelemetry = [];
    const totalMinutes = config.simulationHours * 60;
    const step = Math.max(1, Math.floor(totalMinutes / 12));

    for (let m = 0; m <= totalMinutes; m += step) {
      const curve = Math.sin((m / totalMinutes) * Math.PI);
      const activeOrders = Math.round(curve * (isOverloaded ? 48 : 22) + 4);
      const queue = Math.round(curve * maximumQueueLength);
      const tables = Math.min(45, Math.round(curve * 38 + 6));
      minuteByMinuteTelemetry.push({
        minute: m,
        activeOrdersInKitchen: activeOrders,
        queueLength: queue,
        tablesOccupied: tables,
      });
    }

    let bottleneckStation = 'GRILL_LINE';
    if (config.surgeScenario === 'RAMADAN_IFTAR_RUSH') {
      bottleneckStation = 'PACKAGING_DISPATCH';
    } else if (config.surgeScenario === 'FRIDAY_DINNER_SPIKE') {
      bottleneckStation = 'ASSEMBLY_TABLE';
    }

    const recommendations = [];
    if (isOverloaded) {
      recommendations.push({
        action: 'Deploy 2 standby prep chefs to Assembly Station during peak surge hours.',
        expectedRevenueImpactSar: Number((potentialLostRevenueSar * 0.75).toFixed(2)),
        expectedWaitReductionPct: 38.0,
      });
      recommendations.push({
        action: 'Activate Express Kiosk Pre-ordering mode to smooth kitchen batching.',
        expectedRevenueImpactSar: Number((potentialLostRevenueSar * 0.25).toFixed(2)),
        expectedWaitReductionPct: 22.5,
      });
    } else {
      recommendations.push({
        action: 'Current kitchen station capacity is well-balanced for the selected operational profile.',
        expectedRevenueImpactSar: 0,
        expectedWaitReductionPct: 5.0,
      });
    }

    return {
      simulationId: `sim-twin-${Date.now()}`,
      config,
      totalCustomersServed,
      averageTableDwellMinutes,
      averageKdsTicketTimeMinutes,
      bottleneckStation,
      maximumQueueLength,
      projectedRevenueSar,
      potentialLostRevenueSar,
      staffUtilizationPct,
      recommendations,
      minuteByMinuteTelemetry,
    };
  }
}

export const digitalTwinEngine = new DigitalTwinEngine();
