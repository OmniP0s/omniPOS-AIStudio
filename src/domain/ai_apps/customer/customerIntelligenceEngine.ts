/**
 * Customer Intelligence Engine (Pillar 7)
 * RFM Behavioral Segmentation, Churn Risk Prediction,
 * Hyper-Personalized Loyalty Rewards, and Generative Multi-Channel Campaigns.
 */

import {
  CustomerSegmentProfile,
  ChurnPredictionItem,
  PersonalizedMarketingCampaign,
} from '../types';

export class CustomerIntelligenceEngine {
  /**
   * RFM (Recency, Frequency, Monetary) Customer Segmentation Profiles
   */
  public getCustomerSegments(): CustomerSegmentProfile[] {
    return [
      {
        segmentName: 'VIP_CHAMPIONS',
        customerCount: 1420,
        percentageOfCustomerBase: 12.4,
        averageLtvSar: 4850,
        preferredOrderChannels: ['Dine-In VIP Lounge', 'Direct Web Reservation'],
        recommendedMarketingPlay: 'Invite to exclusive Chef Table dry-aged tasting event with complimentary reserve beverage pairings.',
      },
      {
        segmentName: 'LOYAL_REGULARS',
        customerCount: 3850,
        percentageOfCustomerBase: 33.6,
        averageLtvSar: 2150,
        preferredOrderChannels: ['Dine-In', 'Jahez Pickup'],
        recommendedMarketingPlay: 'Double loyalty points on weekday dinner slots (Sun-Wed) to shift weekend load.',
      },
      {
        segmentName: 'POTENTIAL_LOYALISTS',
        customerCount: 2900,
        percentageOfCustomerBase: 25.3,
        averageLtvSar: 890,
        preferredOrderChannels: ['Takeaway', 'HungerStation'],
        recommendedMarketingPlay: 'Introduce high-value appetizer voucher on 3rd visit to convert into recurring habit.',
      },
      {
        segmentName: 'AT_RISK_CHURN',
        customerCount: 1850,
        percentageOfCustomerBase: 16.2,
        averageLtvSar: 1640,
        preferredOrderChannels: ['Dine-In', 'Delivery'],
        recommendedMarketingPlay: 'Send personalized WhatsApp greeting with 20% comeback code valid for 7 days.',
      },
      {
        segmentName: 'HIBERNATING',
        customerCount: 1430,
        percentageOfCustomerBase: 12.5,
        averageLtvSar: 420,
        preferredOrderChannels: ['Delivery'],
        recommendedMarketingPlay: 'Re-engagement SMS showcasing new seasonal autumn menu items with free delivery.',
      },
    ];
  }

  /**
   * Predict at-risk high value customers with actionable winback offers
   */
  public getAtRiskChurnCustomers(): ChurnPredictionItem[] {
    return [
      {
        customerId: 'CUST-VIP-8821',
        customerName: 'Nasser Al-Ghamdi',
        phone: '+966 50 112 3344',
        daysSinceLastVisit: 42, // Normal cadence was every 9 days
        historicalTotalVisits: 28,
        churnProbabilityPercent: 78,
        churnDrivers: ['Long gap vs historical 9-day visit frequency', 'Previous order had an 8-minute delayed ribeye steak check'],
        winbackOffer: {
          discountTextAr: 'نفتقدك أستاذ ناصر! تفضل بزيارتنا في فرع العليا واستمتع بحلى الزعفران مجاناً مع ضيافة القهوة السعودية.',
          discountTextEn: 'We miss you Mr. Nasser! Visit us at Olaya Flagship for a complimentary Saffron Date Cake & Saudi Coffee hospitality.',
          incentiveCoupon: 'VIP-WELCOME-BACK',
        },
      },
      {
        customerId: 'CUST-VIP-9104',
        customerName: 'Reem Al-Hassan',
        phone: '+966 55 998 7766',
        daysSinceLastVisit: 35,
        historicalTotalVisits: 19,
        churnProbabilityPercent: 64,
        churnDrivers: ['Competitor steakhouse opened nearby in Al-Malqa', 'No visits logged in past month'],
        winbackOffer: {
          discountTextAr: 'أهلاً ريم، طاولتك المفضلة بانتظارك! احصلي على خصم 20% على عشائك القادم.',
          discountTextEn: 'Hello Reem, your favorite table awaits! Enjoy 20% off your next dining experience.',
          incentiveCoupon: 'REEM-VIP-20',
        },
      },
    ];
  }

  /**
   * Generate personalized marketing campaign assets
   */
  public generateMarketingCampaign(targetSegment: string, channel: 'WHATSAPP' | 'SMS' | 'EMAIL' = 'WHATSAPP'): PersonalizedMarketingCampaign {
    return {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      targetSegment,
      channel,
      subjectLineAr: '✨ دعوة حصرية لتجربة قائمة المأكولات الموسمية في أومني ستيك هاوس',
      subjectLineEn: '✨ Exclusive Invitation: Autumn Chef Reserve Tasting at OmniSteakhouse',
      messageBodyAr: `مرحباً بك! يسعدنا دعوتك لتجربة شرائح لحم الواغيو الأسترالي MB7+ مع أطباق الترافل الفاخرة.\n\nاستخدم كود الحجز [AUTUMN-VIP] للحصول على مقبلات مجانية وضيافة القهوة السعودية الفاخرة.\n\n📍 متوفر في فروعنا: الرياض، جدة، الخبر.`,
      messageBodyEn: `Hello! We are delighted to invite you to savor our new Australian Wagyu MB7+ Reserve cuts and artisan black truffle pairings.\n\nUse reservation code [AUTUMN-VIP] to receive a complimentary signature appetizer & curated Saudi Coffee service.\n\n📍 Available in Riyadh, Jeddah, and Khobar.`,
      callToAction: 'https://omnipos.sa/reserve?promo=AUTUMN-VIP',
      estimatedReach: 2450,
      projectedRevenueSar: 185000,
      createdDate: new Date().toISOString().split('T')[0],
    };
  }
}

export const customerIntelligence = new CustomerIntelligenceEngine();
