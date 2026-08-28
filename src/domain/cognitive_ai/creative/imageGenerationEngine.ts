// ============================================================================
// CREATIVE IMAGE GENERATION STUDIO (POSTERS, SOCIAL 9:16/1:1, MENU BOARDS)
// SPRINT 3.3
// ============================================================================

import { ImageAssetType, ImageGenerationJob } from '../types';

export class ImageGenerationEngine {
  private jobs: ImageGenerationJob[] = [];

  constructor() {
    this.initSampleJobs();
  }

  private initSampleJobs(): void {
    this.jobs = [
      {
        jobId: 'img-gen-job-01',
        assetType: 'MARKETING_POSTER',
        targetCampaign: 'SAUDI_NATIONAL_DAY',
        promptEn: 'Ultra-luxurious gourmet Wagyu slider banquet on polished dark basalt stone with emerald green silk accents and Saudi National Day golden calligraphy lighting.',
        promptAr: 'وليمة سلايدر واغيو فاخرة على حجر البازلت الداكن مع لمسات من الحرير الأخضر الزمردي وإضاءة الخط العربي الذهبي لليوم الوطني السعودي.',
        aspectRatio: '16:9',
        imageResolution: '4K',
        generatedImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
        bilingualTypographyOverlay: {
          headingEn: 'A TASTE OF HERITAGE & LUXURY',
          headingAr: 'نكهة الأصالة والفخامة السعودية',
          subtextEn: 'Celebrate Saudi National Day with our signature Gold-Leaf Smoked Wagyu feast.',
          subtextAr: 'احتفل باليوم الوطني السعودي مع وليمة الواغيو المدخن بورق الذهب.',
          callToActionEn: 'RESERVE YOUR TABLE NOW',
          callToActionAr: 'احجز طاولتك الآن',
          badgeText: '94TH NATIONAL DAY',
        },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'COMPLETED',
      },
      {
        jobId: 'img-gen-job-02',
        assetType: 'SOCIAL_STORY_9_16',
        targetCampaign: 'RAMADAN_SEASON',
        promptEn: 'Artisan Iftar dessert platter featuring warm Saudi Date Sticky Toffee Pudding, cardamom cream quenelle, and Arabic coffee smoke vapor.',
        promptAr: 'طبق حلويات إفطار رمضاني فاخر يضم كيكة التمر السعودية الدافئة مع كريمة الهيل وبخار القهوة السعودية.',
        aspectRatio: '9:16',
        imageResolution: '2K',
        generatedImageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
        bilingualTypographyOverlay: {
          headingEn: 'RAMADAN GOURMET NIGHTS',
          headingAr: 'ليالي رمضان الفاخرة',
          subtextEn: 'Complimentary artisan Date Pudding with every Iftar signature set.',
          subtextAr: 'حلا التمر الفاخر مجاناً مع كل وجبة إفطار مميزة.',
          callToActionEn: 'SWIPE UP TO ORDER',
          callToActionAr: 'اسحب للأعلى للطلب',
          badgeText: 'RAMADAN KAREEM',
        },
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        status: 'COMPLETED',
      },
      {
        jobId: 'img-gen-job-03',
        assetType: 'MENU_BOARD_DISPLAY',
        targetCampaign: 'WEEKEND_FEAST',
        promptEn: 'Photorealistic commercial digital menu board visual of Double Truffle Wagyu Burger with melted aged cheddar and rosemary potato crisps.',
        promptAr: 'صورة واقعية لشاشة القائمة الرقمية لبرجر واغيو مزدوج بالكمأة مع جبن الشيدر المعتق ورقائق البطاطس المقرمشة بالروزماري.',
        aspectRatio: '16:9',
        imageResolution: '4K',
        generatedImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        bilingualTypographyOverlay: {
          headingEn: 'SIGNATURE WAGYU COLLECTION',
          headingAr: 'تشكيلة الواغيو الفاخرة',
          subtextEn: '100% Full-Blood Wagyu Beef • Smoked Cherrywood • Brioche Bun',
          subtextAr: 'لحم واغيو صافي 100% • مدخن بحطب الكرز • خبز بريوش طازج',
          callToActionEn: 'ORDER AT KIOSK',
          callToActionAr: 'اطلب من جهاز الخدمة الذاتية',
          badgeText: 'CHEF RECOMMENDATION',
        },
        createdAt: new Date(Date.now() - 600000).toISOString(),
        status: 'COMPLETED',
      },
    ];
  }

  public getAllJobs(): ImageGenerationJob[] {
    return this.jobs;
  }

  public createGenerationJob(
    assetType: ImageAssetType,
    campaign: 'SAUDI_NATIONAL_DAY' | 'RAMADAN_SEASON' | 'FOUNDATION_DAY' | 'SUMMER_MOCKTAILS' | 'WEEKEND_FEAST',
    aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' = '1:1',
    customPromptEn?: string,
    customPromptAr?: string
  ): ImageGenerationJob {
    const imageUrlMap: Record<string, string> = {
      MARKETING_POSTER: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
      SOCIAL_STORY_9_16: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
      SOCIAL_FEED_1_1: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      MENU_BOARD_DISPLAY: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
      RAMADAN_SPECIAL_PROMO: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1200&q=80',
    };

    const newJob: ImageGenerationJob = {
      jobId: `img-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assetType,
      targetCampaign: campaign,
      promptEn: customPromptEn || `High-end commercial food styling visual for ${campaign} campaign featuring OmniPOS culinary masterpiece.`,
      promptAr: customPromptAr || `تصميم تسويقي سينمائي فاخر لحملة ${campaign} يعرض أطباق مطاعم أومني الراقية.`,
      aspectRatio,
      imageResolution: '4K',
      generatedImageUrl: imageUrlMap[assetType] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
      bilingualTypographyOverlay: {
        headingEn: `${campaign.replace(/_/g, ' ')} EXCLUSIVE`,
        headingAr: `عرض حصري بمناسبة ${campaign.replace(/_/g, ' ')}`,
        subtextEn: 'Experience culinary artistry tailored for true connoisseurs.',
        subtextAr: 'عش تجربة طهي استثنائية مصممة لأصحاب الذوق الرفيع.',
        callToActionEn: 'ORDER NOW',
        callToActionAr: 'اطلب الآن',
        badgeText: 'LIMITED EDITION',
      },
      createdAt: new Date().toISOString(),
      status: 'COMPLETED',
    };

    this.jobs.unshift(newJob);
    return newJob;
  }
}

export const imageGenerationEngine = new ImageGenerationEngine();
