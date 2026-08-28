import {
  AiPredictionCard,
  DemandForecastPoint,
  PriceElasticityItem,
  FraudAnomalyAlert,
  VoiceOrderResult,
} from './types';

export const ENTERPRISE_AI_MODELS: AiPredictionCard[] = [
  {
    id: 'AI-MODEL-01',
    task: 'DEMAND_FORECASTING',
    titleEn: 'Prophet + LSTM 30-Day Multimodal Demand Forecaster',
    titleAr: 'نموذج التنبؤ بالطلب للـ 30 يوماً القادمة (Prophet + LSTM)',
    confidenceScore: 98.4,
    impactMetric: '+18.4% Forecasting Precision',
    summaryEn: 'Identified a 28% demand spike for next weekend due to Riyadh Season opening concert in Boulevard.',
    summaryAr: 'توقع زيادة بنسبة 28% في الطلب نهاية الأسبوع القادم تزامناً مع فعاليات موسم الرياض.',
    actionPayload: 'PREP_COMMISSARY_ORDER_INCREASE_25PCT',
    status: 'RECOMMENDATION_READY',
  },
  {
    id: 'AI-MODEL-02',
    task: 'DYNAMIC_PRICING',
    titleEn: 'Real-Time Price Elasticity & Margin Maximizer',
    titleAr: 'محرك مرونة الأسعار الذكي وتعظيم هوامش الربح',
    confidenceScore: 96.2,
    impactMetric: '+140,000 SAR Monthly Margin Lift',
    summaryEn: 'High-margin beverage add-ons are inelastic on delivery apps; recommended +2 SAR on specialty cold brews.',
    summaryAr: 'المشروبات الباردة المختصة غير مرنة سعرياً على تطبيقات التوصيل؛ نوصي بزيادة ريالين مع ثبات حجم الطلب.',
    actionPayload: 'APPLY_DELIVERY_MENU_PRICE_ADJUSTMENT',
    status: 'RECOMMENDATION_READY',
  },
  {
    id: 'AI-MODEL-03',
    task: 'INVENTORY_WASTE_PREDICTION',
    titleEn: 'Shelf-Life & Ingredient Spoilage Prevention AI',
    titleAr: 'نموذج التنبؤ بالهدر وحماية صلاحية المواد الطازجة',
    confidenceScore: 99.1,
    impactMetric: '-42% Spoilage & Scrap Reduction',
    summaryEn: 'Predicted surplus of 45kg fresh brioche buns in Olaya branch by Sunday; triggered automatic commissary re-route.',
    summaryAr: 'توقع فائض 45 كجم من خبز البريوش الطازج؛ تم تفعيل إعادة توجيه ذكية لفرع رد سي مول تلقائياً.',
    actionPayload: 'DISPATCH_INTER_BRANCH_TRANSFER',
    status: 'OPTIMAL',
  },
  {
    id: 'AI-MODEL-04',
    task: 'FRAUD_ANOMALY_DETECTION',
    titleEn: 'Zero-Trust Transaction Anomaly & Cashier Fraud Guard',
    titleAr: 'حارس كشف الاحتيال وشذوذ العمليات النقدية والخصومات',
    confidenceScore: 99.7,
    impactMetric: '0 Unresolved Cash Drawer Drifts',
    summaryEn: 'Real-time statistical outlier detection scanned 142,000 receipts; 0 critical anomalies detected today.',
    summaryAr: 'فحص فوري عبر 142 ألف فاتورة؛ لم يُسجل أي شذوذ غير مصرح به أو تلاعب في الصندوق.',
    actionPayload: 'AUDIT_LOG_CLEAR',
    status: 'OPTIMAL',
  },
  {
    id: 'AI-MODEL-05',
    task: 'VOICE_ORDERING_NLP',
    titleEn: 'Multilingual Voice POS & Drive-Thru Conversational Agent',
    titleAr: 'وكيل الطلب الصوتي الذكي لنقاط البيع وطلبات السيارات (عربي وانجليزي)',
    confidenceScore: 97.9,
    impactMetric: '3.1s Average Voice-to-KDS Order Time',
    summaryEn: 'Accurate dialect recognition across Najdi, Hejazi, and Gulf Arabic with zero modifier omissions.',
    summaryAr: 'تعرف دقيق على اللهجة النجدية والحجازية والخليجية واستخراج التعديلات والمشروبات بدقة متناهية.',
    actionPayload: 'VOICE_PIPELINE_ONLINE',
    status: 'OPTIMAL',
  },
];

export const DEMAND_FORECAST_SERIES: DemandForecastPoint[] = [
  { date: '2026-08-21', historicalGmv: 412000, predictedGmv: 410000, upperConfidence: 425000, lowerConfidence: 395000, weatherFactor: 'Sunny 38°C', eventFactor: 'Regular' },
  { date: '2026-08-22', historicalGmv: 445000, predictedGmv: 440000, upperConfidence: 458000, lowerConfidence: 422000, weatherFactor: 'Clear 37°C', eventFactor: 'Weekend' },
  { date: '2026-08-23', historicalGmv: 498000, predictedGmv: 495000, upperConfidence: 512000, lowerConfidence: 478000, weatherFactor: 'Clear 36°C', eventFactor: 'Weekend Peak' },
  { date: '2026-08-24', historicalGmv: 389000, predictedGmv: 392000, upperConfidence: 405000, lowerConfidence: 379000, weatherFactor: 'Sunny 39°C', eventFactor: 'Weekday' },
  { date: '2026-08-25', historicalGmv: 412000, predictedGmv: 415000, upperConfidence: 428000, lowerConfidence: 402000, weatherFactor: 'Sunny 38°C', eventFactor: 'Weekday' },
  { date: '2026-08-26', historicalGmv: 435000, predictedGmv: 438000, upperConfidence: 450000, lowerConfidence: 426000, weatherFactor: 'Clear 37°C', eventFactor: 'Pre-Weekend' },
  { date: '2026-08-27', historicalGmv: 489000, predictedGmv: 490000, upperConfidence: 508000, lowerConfidence: 472000, weatherFactor: 'Clear 36°C', eventFactor: 'Tonight Peak' },
  { date: '2026-08-28', historicalGmv: 0, predictedGmv: 545000, upperConfidence: 568000, lowerConfidence: 522000, weatherFactor: 'Clear 35°C', eventFactor: 'Boulevard Season (Predicted +28%)' },
  { date: '2026-08-29', historicalGmv: 0, predictedGmv: 580000, upperConfidence: 605000, lowerConfidence: 555000, weatherFactor: 'Clear 35°C', eventFactor: 'Boulevard Season (Predicted +32%)' },
  { date: '2026-08-30', historicalGmv: 0, predictedGmv: 420000, upperConfidence: 438000, lowerConfidence: 402000, weatherFactor: 'Sunny 38°C', eventFactor: 'Weekday Reset' },
];

export const PRICE_ELASTICITY_DATA: PriceElasticityItem[] = [
  {
    sku: 'SKU-BEV-COLDBREW',
    nameEn: 'Artisanal Cold Brew 12oz',
    nameAr: 'كولد برو مقطر فاخر',
    currentPriceSar: 22.0,
    recommendedPriceSar: 24.0,
    expectedMarginLiftPercent: 9.1,
    elasticityCoefficient: -0.28,
    competitorBenchmarkSar: 25.0,
  },
  {
    sku: 'SKU-FOD-TRUFFLEBURGER',
    nameEn: 'Black Truffle Wagyu Burger',
    nameAr: 'برجر واغيو بالكمأة السوداء',
    currentPriceSar: 68.0,
    recommendedPriceSar: 72.0,
    expectedMarginLiftPercent: 5.8,
    elasticityCoefficient: -0.42,
    competitorBenchmarkSar: 75.0,
  },
  {
    sku: 'SKU-SID-FRIES',
    nameEn: 'Skin-on Seasoned Fries',
    nameAr: 'بطاطس مقرمشة متبلة',
    currentPriceSar: 16.0,
    recommendedPriceSar: 16.0,
    expectedMarginLiftPercent: 0.0,
    elasticityCoefficient: -1.85,
    competitorBenchmarkSar: 15.0,
  },
];

export const FRAUD_ANOMALY_FEED: FraudAnomalyAlert[] = [
  {
    id: 'ANOM-01',
    timestamp: '2026-08-27 12:14:02',
    branchName: 'Olaya Flagship Branch',
    cashierName: 'Front Cashier #02',
    anomalyType: 'SUSPICIOUS_DISCOUNT_OVERRIDE',
    riskScore: 12,
    details: 'Supervisor override applied for 15% corporate loyalty discount; Verified with corporate employee badge scan.',
    flaggedAmountSar: 34.5,
  },
];

export const SAMPLE_VOICE_ORDERS: VoiceOrderResult[] = [
  {
    rawAudioTranscript: 'أهلاً، أبغى اثنين واغيو برجر بدون بصل مع بطاطس بالجبنة وواحد كولد برو مع حليب لوز',
    confidence: 0.98,
    detectedIntent: 'CREATE_ORDER',
    extractedCart: [
      { itemSku: 'SKU-WAGYU-01', name: 'Wagyu Burger (No Onion)', qty: 2, modifiers: ['No Onion'], priceSar: 65.0 },
      { itemSku: 'SKU-FRIES-CHZ', name: 'Cheesy Loaded Fries', qty: 1, modifiers: ['Extra Cheddar'], priceSar: 22.0 },
      { itemSku: 'SKU-COLDBREW-01', name: 'Cold Brew (Almond Milk)', qty: 1, modifiers: ['Almond Milk'], priceSar: 26.0 },
    ],
    totalSar: 178.0,
  },
];
