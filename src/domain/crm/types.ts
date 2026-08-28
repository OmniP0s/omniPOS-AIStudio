export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP_BLACK';
export type CampaignChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH_NOTIFICATION';

export interface Customer360Profile {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: LoyaltyTier;
  rfmSegment: 'CHAMPIONS' | 'LOYAL_CUSTOMERS' | 'POTENTIAL_LOYALIST' | 'AT_RISK' | 'HIBERNATING' | 'NEW_GUESTS';
  walletBalanceSar: number;
  loyaltyPoints: number;
  lifetimeSpendSar: number;
  totalOrdersCount: number;
  averageOrderValueSar: number;
  preferredChannel: string;
  favoriteItems: string[];
  lastOrderDate: string;
  registeredDate: string;
  dietaryPreferences: string[];
  referralCode: string;
  successfulReferrals: number;
}

export interface MarketingCampaignJourney {
  id: string;
  nameEn: string;
  nameAr: string;
  channel: CampaignChannel;
  triggerEvent: 'CART_ABANDONED' | 'POST_DINE_IN' | 'INACTIVE_30_DAYS' | 'VIP_BIRTHDAY' | 'LUNCH_RUSH';
  audienceSegment: string;
  messageTemplateEn: string;
  messageTemplateAr: string;
  sentCount: number;
  openRatePercent: number;
  conversionRatePercent: number;
  revenueGeneratedSar: number;
  status: 'ACTIVE' | 'PAUSED';
}

export interface DigitalGiftCard {
  code: string;
  pin: string;
  recipientName: string;
  recipientPhone: string;
  initialBalanceSar: number;
  currentBalanceSar: number;
  expiryDate: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
}

export interface SubscriptionMealPlan {
  id: string;
  planNameEn: string;
  planNameAr: string;
  cadence: 'WEEKLY' | 'MONTHLY';
  mealsPerWeek: number;
  pricePerPeriodSar: number;
  activeSubscribers: number;
  mrrSar: number;
  retentionRatePercent: number;
}
