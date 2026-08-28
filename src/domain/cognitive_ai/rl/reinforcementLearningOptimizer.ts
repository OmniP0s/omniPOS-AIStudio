// ============================================================================
// REINFORCEMENT LEARNING OPTIMIZER (DYNAMIC PRICING, LOAD BALANCING, Q-TABLE)
// SPRINT 3.3
// ============================================================================

import { RlOptimizerState } from '../types';

export class ReinforcementLearningOptimizer {
  private state: RlOptimizerState;

  constructor() {
    this.state = this.initInitialState();
  }

  private initInitialState(): RlOptimizerState {
    const qTableSample = [
      { stateKey: 'PEAK_DINNER:HIGH_INVENTORY_WAGYU', action: 'OFFER_10PCT_UPSELL_BUNDLE', qValue: 48.6, visitCount: 1420 },
      { stateKey: 'PEAK_DINNER:HIGH_INVENTORY_WAGYU', action: 'KEEP_REGULAR_PRICE', qValue: 32.1, visitCount: 890 },
      { stateKey: 'OFF_PEAK_AFTERNOON:LOW_TRAFFIC', action: 'TRIGGER_FLASH_APP_PROMO', qValue: 56.4, visitCount: 2100 },
      { stateKey: 'OFF_PEAK_AFTERNOON:LOW_TRAFFIC', action: 'NO_ACTION', qValue: 12.8, visitCount: 650 },
      { stateKey: 'KITCHEN_SURGE:FRYER_OVERLOAD', action: 'REROUTE_COLD_STARTERS_FIRST', qValue: 64.2, visitCount: 1780 },
      { stateKey: 'KITCHEN_SURGE:FRYER_OVERLOAD', action: 'QUEUE_FIFO_DEFAULT', qValue: 28.5, visitCount: 1120 },
    ];

    const rewardHistory = [
      { episode: 1, reward: 120.5, gmvSar: 4200, wasteSar: 350 },
      { episode: 10, reward: 245.0, gmvSar: 6800, wasteSar: 280 },
      { episode: 50, reward: 480.2, gmvSar: 11500, wasteSar: 190 },
      { episode: 100, reward: 690.8, gmvSar: 16800, wasteSar: 110 },
      { episode: 200, reward: 895.4, gmvSar: 22400, wasteSar: 65 },
      { episode: 500, reward: 1140.0, gmvSar: 29800, wasteSar: 30 },
    ];

    const liveOptimizationSuggestions = [
      {
        targetEntity: 'Double Smoked Wagyu Burger',
        recommendedAction: 'Dynamic surge pricing + SAR 4.00 during 13:00 - 15:00 peak (Elasticity index: -0.22)',
        confidencePct: 97.4,
        expectedRewardUpliftSar: 1850.0,
        appliedStatus: 'ACTIVE' as const,
      },
      {
        targetEntity: 'Walk-In Chiller Ribeye Batch #88',
        recommendedAction: 'Apply 15% VIP app promotion for tonight to eliminate spoilage risk (Expiry in 48h)',
        confidencePct: 98.9,
        expectedRewardUpliftSar: 3400.0,
        appliedStatus: 'ACTIVE' as const,
      },
      {
        targetEntity: 'Kitchen Line 2 (Fryer & Grill)',
        recommendedAction: 'Dynamic batching: Group identical burger patties into 4-ticket simultaneous grill drops',
        confidencePct: 96.0,
        expectedRewardUpliftSar: 920.0,
        appliedStatus: 'PENDING_APPROVAL' as const,
      },
    ];

    return {
      currentIteration: 500,
      totalRewardCumulative: 845200.0,
      averageRewardPerEpisode: 1140.0,
      explorationRateEpsilon: 0.05,
      learningRateAlpha: 0.1,
      discountFactorGamma: 0.95,
      activePolicy: 'DYNAMIC_PRICING',
      qTableSample,
      rewardHistory,
      liveOptimizationSuggestions,
    };
  }

  public getState(): RlOptimizerState {
    return this.state;
  }

  public stepTraining(episodes: number = 50): RlOptimizerState {
    this.state.currentIteration += episodes;
    this.state.explorationRateEpsilon = Math.max(0.01, this.state.explorationRateEpsilon * 0.98);

    const latestEpisode = this.state.rewardHistory[this.state.rewardHistory.length - 1];
    const newReward = Number((latestEpisode.reward + (Math.random() * 40 - 5)).toFixed(1));
    const newGmv = Math.round(latestEpisode.gmvSar + Math.random() * 800 + 400);
    const newWaste = Math.max(15, Math.round(latestEpisode.wasteSar - Math.random() * 5));

    this.state.rewardHistory.push({
      episode: this.state.currentIteration,
      reward: newReward,
      gmvSar: newGmv,
      wasteSar: newWaste,
    });

    if (this.state.rewardHistory.length > 20) {
      this.state.rewardHistory.shift();
    }

    this.state.averageRewardPerEpisode = newReward;
    return this.state;
  }
}

export const reinforcementLearningOptimizer = new ReinforcementLearningOptimizer();
