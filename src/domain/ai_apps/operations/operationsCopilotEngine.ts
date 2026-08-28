/**
 * Restaurant Operations Copilot Engine (Pillar 2)
 * Kitchen Station Balancing, Real-Time Queue & Wait Time Prediction,
 * Staff Scheduling Optimization, and Multi-Branch Performance SLA Diagnostics.
 */

import {
  KitchenOptimizationInsight,
  WaitTimePrediction,
  StaffScheduleOptimization,
  BranchPerformanceRank,
} from '../types';

export class OperationsCopilotEngine {
  /**
   * Kitchen KDS Line Load Balancing & Bottleneck Detection
   */
  public getKitchenStationInsights(branchId: string = 'BR-OLAYA-01'): KitchenOptimizationInsight[] {
    return [
      {
        stationId: 'STN-GRILL-01',
        stationName: 'Charcoal & Plancha Grill',
        currentQueueDepth: 14,
        averagePrepTimeMinutes: 12.5,
        targetPrepTimeMinutes: 8.0,
        bottleneckRisk: 'CRITICAL',
        recommendedReallocation: 'Route secondary burger patties to Backup Plancha 2; assign Prep Line Assistant to sear station.',
      },
      {
        stationId: 'STN-FRY-02',
        stationName: 'Fryers & Sides Assembly',
        currentQueueDepth: 6,
        averagePrepTimeMinutes: 4.2,
        targetPrepTimeMinutes: 5.0,
        bottleneckRisk: 'NORMAL',
        recommendedReallocation: 'Station running at optimal flow; pre-drop 2 batches of truffle parmesan fries for anticipated 8:30 PM wave.',
      },
      {
        stationId: 'STN-SALAD-03',
        stationName: 'Cold Garde Manger & Desserts',
        currentQueueDepth: 9,
        averagePrepTimeMinutes: 7.8,
        targetPrepTimeMinutes: 6.0,
        bottleneckRisk: 'WARNING',
        recommendedReallocation: 'Pre-portion artisan burrata & Caesar dressings to reduce plating latency by 110 seconds.',
      },
      {
        stationId: 'STN-EXPO-04',
        stationName: 'KDS Master Expediter & Packing',
        currentQueueDepth: 5,
        averagePrepTimeMinutes: 2.1,
        targetPrepTimeMinutes: 2.5,
        bottleneckRisk: 'NORMAL',
        recommendedReallocation: 'Aggregator dispatch flow optimal; driver check-in matches packaging readiness.',
      },
    ];
  }

  /**
   * Real-time wait time prediction with confidence intervals
   */
  public predictWaitTime(partySize: number, branchId: string = 'BR-OLAYA-01'): WaitTimePrediction {
    const queueDepth = partySize > 4 ? 6 : 9;
    const baseMinutesPerParty = partySize > 4 ? 6.5 : 3.8;
    const estimatedWait = Math.round(queueDepth * baseMinutesPerParty);

    return {
      partySize,
      currentWaitingParties: queueDepth,
      estimatedWaitMinutes: estimatedWait,
      confidenceLowMinutes: Math.max(5, estimatedWait - 5),
      confidenceHighMinutes: estimatedWait + 8,
      suggestedAction: partySize > 4
        ? 'Offer waiting party complimentary Mocktail Samples in the lounge area while table #14 completes dessert course.'
        : 'Table #8 is settling check; seating expected within 4 minutes.',
    };
  }

  /**
   * Staff Schedule Optimization based on forecasted guest arrivals
   */
  public getStaffScheduleOptimization(branchId: string = 'BR-OLAYA-01'): StaffScheduleOptimization {
    const hourlyData = [
      { hour: 12, predictedGuestVolume: 45, currentStaffAssigned: 6, optimalStaffCount: 6, variance: 0, action: 'BALANCED' as const },
      { hour: 13, predictedGuestVolume: 88, currentStaffAssigned: 7, optimalStaffCount: 9, variance: -2, action: 'ADD_STAFF' as const },
      { hour: 14, predictedGuestVolume: 110, currentStaffAssigned: 8, optimalStaffCount: 11, variance: -3, action: 'ADD_STAFF' as const },
      { hour: 15, predictedGuestVolume: 35, currentStaffAssigned: 8, optimalStaffCount: 5, variance: 3, action: 'REDUCE_STAFF' as const },
      { hour: 16, predictedGuestVolume: 20, currentStaffAssigned: 6, optimalStaffCount: 4, variance: 2, action: 'REDUCE_STAFF' as const },
      { hour: 17, predictedGuestVolume: 30, currentStaffAssigned: 5, optimalStaffCount: 4, variance: 1, action: 'REDUCE_STAFF' as const },
      { hour: 18, predictedGuestVolume: 65, currentStaffAssigned: 7, optimalStaffCount: 8, variance: -1, action: 'ADD_STAFF' as const },
      { hour: 19, predictedGuestVolume: 125, currentStaffAssigned: 10, optimalStaffCount: 13, variance: -3, action: 'ADD_STAFF' as const },
      { hour: 20, predictedGuestVolume: 160, currentStaffAssigned: 12, optimalStaffCount: 15, variance: -3, action: 'ADD_STAFF' as const },
      { hour: 21, predictedGuestVolume: 140, currentStaffAssigned: 12, optimalStaffCount: 14, variance: -2, action: 'ADD_STAFF' as const },
      { hour: 22, predictedGuestVolume: 75, currentStaffAssigned: 10, optimalStaffCount: 8, variance: 2, action: 'REDUCE_STAFF' as const },
    ];

    return {
      branchId,
      branchName: 'Olaya Flagship, Riyadh',
      date: new Date().toISOString().split('T')[0],
      hourlyRecommendations: hourlyData,
      totalLaborSavingsSar: 4200, // Monthly projected optimization
    };
  }

  /**
   * Multi-Branch Operational Performance Diagnostic Rankings
   */
  public getBranchPerformanceRankings(): BranchPerformanceRank[] {
    return [
      {
        branchId: 'BR-OLAYA-01',
        branchName: 'Olaya Flagship',
        city: 'Riyadh',
        operationalScore: 94,
        tableTurnoverRate: 1.85,
        orderAccuracyPercent: 99.2,
        avgDeliveryPrepTimeMins: 11.2,
        kdsSlaBreachRatePercent: 1.4,
        aiSuggestedFix: 'Maintain current station load balancing; cross-train 2 commis chefs on plancha grill.',
      },
      {
        branchId: 'BR-NAKHEEL-02',
        branchName: 'Al-Nakheel Mall',
        city: 'Riyadh',
        operationalScore: 88,
        tableTurnoverRate: 2.10,
        orderAccuracyPercent: 98.1,
        avgDeliveryPrepTimeMins: 13.8,
        kdsSlaBreachRatePercent: 3.8,
        aiSuggestedFix: 'Add secondary thermal ticket printer at packaging station to prevent delivery runner queueing.',
      },
      {
        branchId: 'BR-CORNICHE-03',
        branchName: 'Corniche Waterfront',
        city: 'Jeddah',
        operationalScore: 82,
        tableTurnoverRate: 1.45,
        orderAccuracyPercent: 96.5,
        avgDeliveryPrepTimeMins: 16.5,
        kdsSlaBreachRatePercent: 7.2,
        aiSuggestedFix: 'Dinner service grill bottleneck detected; adjust batch par-levels for prime steaks 45 minutes prior to sundown.',
      },
      {
        branchId: 'BR-KHOBAR-04',
        branchName: 'Dhahran Hills',
        city: 'Khobar',
        operationalScore: 91,
        tableTurnoverRate: 1.65,
        orderAccuracyPercent: 98.8,
        avgDeliveryPrepTimeMins: 12.0,
        kdsSlaBreachRatePercent: 2.1,
        aiSuggestedFix: 'Exemplary speed of service; recommend utilizing shift roster as gold standard template for network.',
      },
    ];
  }
}

export const operationsCopilot = new OperationsCopilotEngine();
