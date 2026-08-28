// Advanced Menu Engine, Dynamic Pricing, Combos, Allergens & Recipe COGS
import { MenuItem, MenuSchedule, MenuVersion, InventoryItem, Allergen, NutritionFact } from '../../types';

export const initialMenuVersions: MenuVersion[] = [
  {
    id: 'mv-v2.8',
    versionNumber: 'v2.8.0',
    name: 'Autumn 2026 Premium Menu & Truffle Special',
    status: 'PUBLISHED',
    publishedAt: '2026-08-01T00:00:00Z',
    changesSummary: 'Added Wagyu Truffle Supreme, Passionfruit Mojito, and updated Brioche supplier costs.',
    itemCount: 42,
  },
  {
    id: 'mv-v2.9-draft',
    versionNumber: 'v2.9.0-BETA',
    name: 'National Day 96 Promo & Special Combos',
    status: 'DRAFT',
    publishedAt: '2026-09-20T00:00:00Z',
    changesSummary: 'Includes Green Apple Spritz, Special Family Feast Bundle, and Saudi Coffee specials.',
    itemCount: 48,
  },
];

export const initialMenuSchedules: MenuSchedule[] = [
  {
    id: 'sch-happy-hour',
    nameEn: 'Afternoon Happy Hour (Coffee & Dessert 20% Off)',
    nameAr: 'ساعة السعادة المسائية (خصم 20% على القهوة والحلويات)',
    daysOfWeek: [0, 1, 2, 3, 4], // Sun to Thu
    startTime: '16:00',
    endTime: '19:00',
    priceDiscountPercent: 20,
    isHappyHour: true,
    active: true,
  },
  {
    id: 'sch-lunch-express',
    nameEn: 'Lunch Express Business Hour (10% Off Combos)',
    nameAr: 'ساعة الغداء السريع لرجال الأعمال (خصم 10% على الوجبات)',
    daysOfWeek: [0, 1, 2, 3, 4],
    startTime: '12:00',
    endTime: '15:30',
    priceDiscountPercent: 10,
    isHappyHour: false,
    active: true,
  },
];

export class MenuEngine {
  private versions: MenuVersion[] = [...initialMenuVersions];
  private schedules: MenuSchedule[] = [...initialMenuSchedules];

  public getVersions(): MenuVersion[] {
    return this.versions;
  }

  public getSchedules(): MenuSchedule[] {
    return this.schedules;
  }

  // Check if a schedule is currently active based on system time or custom time
  public getActiveSchedule(currentTime: Date = new Date()): MenuSchedule | null {
    const day = currentTime.getDay();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    for (const schedule of this.schedules) {
      if (!schedule.active) continue;
      if (schedule.daysOfWeek.includes(day)) {
        if (timeStr >= schedule.startTime && timeStr <= schedule.endTime) {
          return schedule;
        }
      }
    }
    return null;
  }

  // Calculate live dynamic price considering happy hour schedules
  public resolveItemPrice(item: MenuItem, activeSchedule: MenuSchedule | null = null): { finalPrice: number; originalPrice: number; discountApplied: number; scheduleName?: string } {
    const originalPrice = item.price;
    if (item.happyHourPrice && activeSchedule?.isHappyHour) {
      const finalPrice = item.happyHourPrice;
      return {
        finalPrice,
        originalPrice,
        discountApplied: Number((originalPrice - finalPrice).toFixed(2)),
        scheduleName: activeSchedule.nameEn,
      };
    }

    if (activeSchedule && activeSchedule.priceDiscountPercent > 0) {
      const discount = (originalPrice * activeSchedule.priceDiscountPercent) / 100;
      const finalPrice = Math.max(0, originalPrice - discount);
      return {
        finalPrice: Number(finalPrice.toFixed(2)),
        originalPrice,
        discountApplied: Number(discount.toFixed(2)),
        scheduleName: activeSchedule.nameEn,
      };
    }

    return {
      finalPrice: originalPrice,
      originalPrice,
      discountApplied: 0,
    };
  }

  // Calculate real-time Recipe COGS and Margin % based on current raw inventory prices
  public calculateRecipeCogs(item: MenuItem, inventoryItems: InventoryItem[]): {
    totalCost: number;
    sellingPrice: number;
    grossProfit: number;
    foodCostPercentage: number;
    marginPercentage: number;
    rating: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  } {
    let computedCost = 0;

    if (item.recipe && item.recipe.length > 0) {
      for (const ingredient of item.recipe) {
        const rawItem = inventoryItems.find(inv => inv.id === ingredient.inventoryItemId);
        if (rawItem) {
          const wasteFactor = 1 + (ingredient.wastePercentage || 0) / 100;
          computedCost += rawItem.costPerUnit * ingredient.quantity * wasteFactor;
        }
      }
    } else {
      computedCost = item.costPrice || 0;
    }

    const sellingPrice = item.price;
    const grossProfit = Math.max(0, sellingPrice - computedCost);
    const foodCostPercentage = sellingPrice > 0 ? (computedCost / sellingPrice) * 100 : 0;
    const marginPercentage = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

    let rating: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (foodCostPercentage > 38) rating = 'CRITICAL';
    else if (foodCostPercentage > 30) rating = 'WARNING';

    return {
      totalCost: Number(computedCost.toFixed(2)),
      sellingPrice,
      grossProfit: Number(grossProfit.toFixed(2)),
      foodCostPercentage: Number(foodCostPercentage.toFixed(1)),
      marginPercentage: Number(marginPercentage.toFixed(1)),
      rating,
    };
  }

  // Format Allergen tags
  public getAllergenBadges(allergens?: Allergen[]): { code: Allergen; labelEn: string; labelAr: string; color: string }[] {
    if (!allergens || allergens.length === 0) return [];

    const map: Record<Allergen, { labelEn: string; labelAr: string; color: string }> = {
      GLUTEN: { labelEn: 'Gluten', labelAr: 'جلوتين', color: 'amber' },
      DAIRY: { labelEn: 'Dairy', labelAr: 'مشتقات حليب', color: 'blue' },
      EGGS: { labelEn: 'Eggs', labelAr: 'بيض', color: 'yellow' },
      NUTS: { labelEn: 'Tree Nuts', labelAr: 'مكسرات', color: 'red' },
      PEANUTS: { labelEn: 'Peanuts', labelAr: 'فول سوداني', color: 'orange' },
      SOY: { labelEn: 'Soy', labelAr: 'صويا', color: 'emerald' },
      FISH: { labelEn: 'Fish', labelAr: 'أسماك', color: 'cyan' },
      SHELLFISH: { labelEn: 'Shellfish', labelAr: 'قشريات', color: 'rose' },
      SESAME: { labelEn: 'Sesame', labelAr: 'سمسم', color: 'teal' },
      MUSTARD: { labelEn: 'Mustard', labelAr: 'خردل', color: 'lime' },
    };

    return allergens.map(a => ({
      code: a,
      labelEn: map[a]?.labelEn || a,
      labelAr: map[a]?.labelAr || a,
      color: map[a]?.color || 'slate',
    }));
  }
}

export const globalMenuEngine = new MenuEngine();
