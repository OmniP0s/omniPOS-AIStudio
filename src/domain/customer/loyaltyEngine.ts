// Customer Loyalty, Wallet, Promotion & RFM Engine
import { Customer, CouponPromo, GiftCard, CustomerTimelineEvent } from '../../types';

export const initialCoupons: CouponPromo[] = [
  {
    id: 'cp-welcome20',
    code: 'WELCOME20',
    titleEn: '20% Off First Dine-In Experience',
    titleAr: 'خصم 20% على أول زيارة للمطعم',
    type: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 100,
    maxDiscountAmount: 50,
    usageCount: 142,
    maxUsageLimit: 500,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'cp-vip50sar',
    code: 'VIP50',
    titleEn: '50 SAR Direct Off on Orders > 250 SAR',
    titleAr: 'خصم 50 ريال على الطلبات فوق 250 ريال',
    type: 'FIXED_AMOUNT',
    discountValue: 50,
    minOrderAmount: 250,
    usageCount: 88,
    maxUsageLimit: 200,
    startDate: '2026-06-01',
    endDate: '2026-10-01',
    isActive: true,
  },
  {
    id: 'cp-dessert-free',
    code: 'FREESANSEB',
    titleEn: 'Free San Sebastian Cheesecake with Wagyu',
    titleAr: 'تشيز كيك مجاني مع وجبة الواغيو',
    type: 'FREE_ITEM',
    discountValue: 38,
    minOrderAmount: 180,
    usageCount: 215,
    maxUsageLimit: 1000,
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    isActive: true,
  },
];

export class LoyaltyEngine {
  private coupons: CouponPromo[] = [...initialCoupons];

  public getCoupons(): CouponPromo[] {
    return this.coupons;
  }

  // Validate coupon code against subtotal
  public validateCoupon(code: string, subtotal: number): { valid: boolean; discountAmount: number; coupon?: CouponPromo; error?: string } {
    const trimmed = code.trim().toUpperCase();
    const coupon = this.coupons.find(c => c.code.toUpperCase() === trimmed && c.isActive);

    if (!coupon) {
      return { valid: false, discountAmount: 0, error: 'Invalid or inactive promo code (رمز الخصم غير صحيح أو منتهي الصلاحية)' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        coupon,
        error: `Minimum spend of SAR ${coupon.minOrderAmount} required (الحد الأدنى للطلب ${coupon.minOrderAmount} ر.س)`,
      };
    }

    if (coupon.usageCount >= coupon.maxUsageLimit) {
      return { valid: false, discountAmount: 0, coupon, error: 'Promo code usage limit reached (تم استنفاد الحد الأقصى لاستخدام الكوبون)' };
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === 'FIXED_AMOUNT' || coupon.type === 'FREE_ITEM') {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);

    return {
      valid: true,
      discountAmount: Number(discount.toFixed(2)),
      coupon,
    };
  }

  // Evaluate and recalculate customer loyalty tier
  public evaluateLoyaltyTier(totalSpend: number, visitCount: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
    if (totalSpend >= 5000 || visitCount >= 30) return 'PLATINUM';
    if (totalSpend >= 2000 || visitCount >= 15) return 'GOLD';
    if (totalSpend >= 600 || visitCount >= 5) return 'SILVER';
    return 'BRONZE';
  }

  // Calculate points to award: 1 SAR = 1 Point (Bronze: 1x, Silver: 1.25x, Gold: 1.5x, Platinum: 2x)
  public calculatePointsEarned(paidAmount: number, tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'): number {
    const multipliers = {
      BRONZE: 1.0,
      SILVER: 1.25,
      GOLD: 1.5,
      PLATINUM: 2.0,
    };
    return Math.floor(paidAmount * multipliers[tier]);
  }

  // Convert points to SAR discount: 100 Points = 5 SAR
  public convertPointsToSar(points: number): number {
    return Number(((points / 100) * 5).toFixed(2));
  }

  // RFM Analysis segment categorizer
  public classifyRfmSegment(customer: Customer): 'CHAMPIONS' | 'LOYAL' | 'POTENTIAL' | 'AT_RISK' | 'LOST' {
    const daysSinceLastVisit = Math.floor((Date.now() - new Date(customer.lastVisit || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit <= 14 && customer.totalSpend >= 2500) return 'CHAMPIONS';
    if (daysSinceLastVisit <= 30 && customer.visitCount >= 6) return 'LOYAL';
    if (daysSinceLastVisit <= 45 && customer.visitCount >= 2) return 'POTENTIAL';
    if (daysSinceLastVisit > 45 && daysSinceLastVisit <= 90) return 'AT_RISK';
    return 'LOST';
  }
}

export const globalLoyaltyEngine = new LoyaltyEngine();
