// ============================================================================
// ENTERPRISE COGNITIVE & MULTIMODAL AI PLATFORM TYPES
// SPRINT 3.3: VOICE AI, VISION AI, DOCUMENT INTEL, VIDEO, DIGITAL TWIN & RL
// ============================================================================

export type ArabicDialect = 'NAJDI' | 'HIJAZI' | 'GULF' | 'EGYPTIAN' | 'MSA' | 'ENGLISH_UK' | 'ENGLISH_US';

export interface SttTranscriptionResult {
  transcriptId: string;
  audioDurationSeconds: number;
  detectedDialect: ArabicDialect;
  transcriptionEn: string;
  transcriptionAr: string;
  confidenceScorePct: number;
  wordTimestamps: {
    word: string;
    startMs: number;
    endMs: number;
    confidence: number;
  }[];
  recognizedEntities: {
    entityType: 'MENU_ITEM' | 'QUANTITY' | 'TABLE_NUMBER' | 'MODIFIER' | 'DISCOUNT' | 'PAYMENT_METHOD';
    entityValue: string;
    normalizedValue: string | number;
  }[];
  processedAt: string;
}

export interface TtsSynthesisRequest {
  text: string;
  languageCode: 'ar-SA' | 'en-US';
  voiceName: 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Charon';
  speakingRate: number; // 0.8 - 1.5
  pitch: number; // -5 to +5
  emotionStyle?: 'PROFESSIONAL' | 'FRIENDLY_HOSPITALITY' | 'URGENT_ALERT';
}

export interface TtsSynthesisResult {
  audioBase64: string;
  mimeType: string;
  sampleRateHz: number;
  durationMs: number;
  textSynthesized: string;
  voiceUsed: string;
  synthesizedAt: string;
}

export interface VoiceAgentSession {
  sessionId: string;
  channel: 'DRIVE_THRU' | 'CALL_CENTER' | 'KITCHEN_HEADSET' | 'POS_HANDS_FREE';
  customerIdentifier?: string;
  currentTurnCount: number;
  sessionState: 'LISTENING' | 'THINKING' | 'SPEAKING' | 'EXECUTING_ORDER' | 'COMPLETED';
  cartItems: {
    menuItemId: string;
    nameEn: string;
    nameAr: string;
    quantity: number;
    priceSar: number;
    modifiers: string[];
  }[];
  cartTotalSar: number;
  vatAmountSar: number;
  conversationHistory: {
    role: 'USER' | 'AGENT';
    text: string;
    timestamp: string;
    audioUrl?: string;
  }[];
  suggestedUpsells: string[];
}

export interface VoiceCommandIntent {
  rawSpokenText: string;
  intent: 'ADD_ITEM_TO_ORDER' | 'APPLY_DISCOUNT' | 'SPLIT_BILL' | 'PRINT_ZATCA_INVOICE' | 'HOLD_KITCHEN_TICKET' | 'QUERY_STOCK' | 'CALL_MANAGER';
  confidence: number;
  parameters: Record<string, any>;
  actionStatus: 'EXECUTED' | 'REQUIRES_CONFIRMATION' | 'FAILED';
  systemResponseEn: string;
  systemResponseAr: string;
}

// ==========================================
// VISION AI & ADVANCED OCR
// ==========================================

export type OcrSourceType = 'THERMAL_RECEIPT' | 'ZATCA_TAX_INVOICE' | 'SUPPLIER_INVOICE' | 'HANDWRITTEN_NOTE' | 'BALADY_LICENSE';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface OcrExtractedLineItem {
  lineNumber: number;
  itemDescriptionEn: string;
  itemDescriptionAr: string;
  quantity: number;
  unitPriceSar: number;
  taxRatePct: number;
  taxAmountSar: number;
  lineTotalSar: number;
  confidencePct: number;
  boundingBox?: BoundingBox;
}

export interface AdvancedOcrResult {
  scanId: string;
  documentType: OcrSourceType;
  supplierNameEn?: string;
  supplierNameAr?: string;
  vatRegistrationNumber?: string;
  invoiceDate?: string;
  invoiceNumber?: string;
  currency: string;
  lineItems: OcrExtractedLineItem[];
  subtotalSar: number;
  vatTotalSar: number;
  grandTotalSar: number;
  zatcaQrRawPayload?: string;
  isZatcaQrValid?: boolean;
  handwrittenNotesDetected?: string[];
  overallConfidencePct: number;
  processingTimeMs: number;
  scannedAt: string;
}

export interface KitchenCameraMonitoringEvent {
  cameraId: string;
  stationName: 'GRILL_LINE' | 'FRYER_STATION' | 'ASSEMBLY_TABLE' | 'PACKAGING_DISPATCH';
  timestamp: string;
  activeTicketId?: string;
  ticketCookingTimeSeconds: number;
  cookingTimeTargetSeconds: number;
  hygieneCompliance: {
    chefHatDetected: boolean;
    glovesDetected: boolean;
    apronDetected: boolean;
    crossContaminationRisk: 'NONE' | 'LOW' | 'HIGH';
  };
  platingQuality: {
    portionAdherencePct: number;
    garnishFreshnessGrade: 'A' | 'B' | 'C';
    steakDonenessGrading?: 'RARE' | 'MEDIUM_RARE' | 'MEDIUM' | 'WELL_DONE';
    presentationScorePct: number;
  };
  alerts: string[];
}

export interface ShelfInventoryDetectionResult {
  shelfId: string;
  zone: 'WALK_IN_CHILLER' | 'DRY_STORAGE_A' | 'BEVERAGE_DISPENSE' | 'MEAT_PREP_ROOM';
  timestamp: string;
  detectedItems: {
    sku: string;
    productNameEn: string;
    productNameAr: string;
    currentStockCount: number;
    maxCapacity: number;
    fillPercentage: number;
    boundingBox: BoundingBox;
    isBelowReorderThreshold: boolean;
  }[];
  criticalStockouts: string[];
  shelfImageAnnotatedUrl?: string;
}

// ==========================================
// DOCUMENT INTELLIGENCE
// ==========================================

export type EnterpriseDocFormat = 'PDF' | 'EXCEL_XLSX' | 'WORD_DOCX' | 'IMAGE_SCANNED' | 'SUPPLIER_CONTRACT';

export interface DocumentIntelligenceReport {
  documentId: string;
  documentName: string;
  format: EnterpriseDocFormat;
  documentCategory: 'SUPPLIER_MASTER_AGREEMENT' | 'COMMERCIAL_LEASE' | 'MUNICIPAL_BALADY_PERMIT' | 'FOOD_SAFETY_AUDIT' | 'PRICE_CATALOG';
  extractedKeyValues: Record<string, string | number>;
  extractedClauses: {
    clauseTitleEn: string;
    clauseTitleAr: string;
    clauseSummary: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    penaltyTerms?: string;
    slaDays?: number;
  }[];
  criticalDates: {
    label: string;
    date: string;
    daysRemaining: number;
    status: 'ACTIVE' | 'UPCOMING_EXPIRY' | 'EXPIRED';
  }[];
  complianceScorePct: number;
  recommendedActions: string[];
  processedAt: string;
}

// ==========================================
// VIDEO INTELLIGENCE & SPATIAL TELEMETRY
// ==========================================

export interface CctvSecurityEvent {
  eventId: string;
  cameraLocation: 'MAIN_ENTRANCE' | 'DINING_ZONE_1' | 'DRIVE_THRU_LANE' | 'CASH_REGISTER_1' | 'KITCHEN_REAR';
  timestamp: string;
  eventType: 'QUEUE_SURGE' | 'SLIP_AND_FALL_RISK' | 'UNAUTHORIZED_AFTER_HOURS_ENTRY' | 'CASH_DRAWER_OPEN_LONG' | 'TABLE_DWELL_LIMIT_EXCEEDED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  confidencePct: number;
  snapshotUrl?: string;
  automatedRemediationTaken?: string;
}

export interface QueueTelemetry {
  zoneId: string;
  zoneName: string;
  currentVehicleCount?: number;
  currentCustomerCount: number;
  averageWaitTimeSeconds: number;
  targetMaxWaitSeconds: number;
  queueStatus: 'OPTIMAL' | 'MODERATE' | 'CRITICAL_BOTTLENECK';
  historicalHourlyTrend: { hour: string; avgWaitSec: number; customerVolume: number }[];
}

export interface SpatialHeatmapZone {
  zoneId: string;
  zoneLabel: string;
  coordinates: { x: number; y: number; width: number; height: number };
  currentDwellTimeMinutes: number;
  trafficDensityPct: number; // 0 - 100
  bottleneckDetected: boolean;
}

// ==========================================
// CREATIVE IMAGE GENERATION STUDIO
// ==========================================

export type ImageAssetType = 'MARKETING_POSTER' | 'SOCIAL_STORY_9_16' | 'SOCIAL_FEED_1_1' | 'MENU_BOARD_DISPLAY' | 'RAMADAN_SPECIAL_PROMO';

export interface ImageGenerationJob {
  jobId: string;
  assetType: ImageAssetType;
  promptEn: string;
  promptAr: string;
  aspectRatio: '1:1' | '9:16' | '16:9' | '4:3';
  imageResolution: '1K' | '2K' | '4K';
  targetCampaign: 'SAUDI_NATIONAL_DAY' | 'RAMADAN_SEASON' | 'FOUNDATION_DAY' | 'SUMMER_MOCKTAILS' | 'WEEKEND_FEAST';
  generatedImageUrl: string;
  bilingualTypographyOverlay: {
    headingEn: string;
    headingAr: string;
    subtextEn: string;
    subtextAr: string;
    callToActionEn: string;
    callToActionAr: string;
    badgeText?: string;
  };
  createdAt: string;
  status: 'QUEUED' | 'GENERATING' | 'COMPLETED' | 'FAILED';
}

// ==========================================
// ENTERPRISE SEMANTIC SEARCH
// ==========================================

export interface SemanticSearchResult {
  documentId: string;
  documentTitle: string;
  documentSource: 'RECIPE_BOOK' | 'KITCHEN_SOP' | 'HR_MANUAL' | 'ZATCA_REGULATIONS' | 'SUPPLIER_CONTRACT' | 'EQUIPMENT_GUIDE';
  matchScorePct: number;
  matchedSnippet: string;
  matchedSnippetAr?: string;
  citations: {
    pageNumber: number;
    sectionTitle: string;
    exactQuote: string;
  }[];
  verifiedFactual: boolean;
}

// ==========================================
// DIGITAL TWIN SIMULATOR
// ==========================================

export interface DigitalTwinSimulationConfig {
  branchId: string;
  simulationHours: number;
  customerArrivalRatePerHour: number; // Lambda
  kitchenThroughputOrdersPerHour: number; // Mu
  activeKitchenStations: number;
  activeStaffCount: number;
  driveThruEnabled: boolean;
  surgeScenario: 'BASELINE_NORMAL' | 'FRIDAY_DINNER_SPIKE' | 'RAMADAN_IFTAR_RUSH' | 'NATIONAL_DAY_EXTREME';
}

export interface DigitalTwinSimulationResult {
  simulationId: string;
  config: DigitalTwinSimulationConfig;
  totalCustomersServed: number;
  averageTableDwellMinutes: number;
  averageKdsTicketTimeMinutes: number;
  bottleneckStation: string;
  maximumQueueLength: number;
  projectedRevenueSar: number;
  potentialLostRevenueSar: number;
  staffUtilizationPct: number;
  recommendations: {
    action: string;
    expectedRevenueImpactSar: number;
    expectedWaitReductionPct: number;
  }[];
  minuteByMinuteTelemetry: {
    minute: number;
    activeOrdersInKitchen: number;
    queueLength: number;
    tablesOccupied: number;
  }[];
}

// ==========================================
// REINFORCEMENT LEARNING OPTIMIZER
// ==========================================

export interface RlOptimizerState {
  currentIteration: number;
  totalRewardCumulative: number;
  averageRewardPerEpisode: number;
  explorationRateEpsilon: number;
  learningRateAlpha: number;
  discountFactorGamma: number;
  activePolicy: 'DYNAMIC_PRICING' | 'KITCHEN_LINE_BALANCING' | 'TABLE_TURN_OPTIMIZER' | 'MENU_RANKING_SURVIVAL';
  qTableSample: {
    stateKey: string;
    action: string;
    qValue: number;
    visitCount: number;
  }[];
  rewardHistory: { episode: number; reward: number; gmvSar: number; wasteSar: number }[];
  liveOptimizationSuggestions: {
    targetEntity: string;
    recommendedAction: string;
    confidencePct: number;
    expectedRewardUpliftSar: number;
    appliedStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED';
  }[];
}

// ==========================================
// AI EXPERIMENT PLATFORM & BENCHMARKING
// ==========================================

export interface AbTestExperiment {
  experimentId: string;
  experimentName: string;
  targetFeature: 'VOICE_AGENT_UPSELL_PROMPT' | 'DYNAMIC_MENU_HERO_IMAGE' | 'KITCHEN_COOK_PREDICTOR' | 'RECOMMENDER_ALGORITHM';
  variantA: {
    name: string;
    promptTemplate: string;
    trafficAllocationPct: number;
    sampleSize: number;
    conversionRatePct: number;
    averageOrderValueSar: number;
  };
  variantB: {
    name: string;
    promptTemplate: string;
    trafficAllocationPct: number;
    sampleSize: number;
    conversionRatePct: number;
    averageOrderValueSar: number;
  };
  pValue: number;
  statisticalSignificanceReached: boolean;
  winningVariant?: 'VARIANT_A' | 'VARIANT_B' | 'INCONCLUSIVE';
  startDate: string;
  endDate?: string;
  status: 'RUNNING' | 'COMPLETED' | 'PAUSED';
}

export interface PromptEvaluationTestCase {
  testId: string;
  category: 'ZATCA_INVOICING' | 'VOICE_ORDER_PARSING' | 'FOOD_SAFETY_AUDIT' | 'LEGAL_COMPLIANCE' | 'MULTILINGUAL_TRANSLATION';
  inputPrompt: string;
  expectedOutputSubstring: string;
  actualOutputGemini37Flash: string;
  actualOutputGemini31Pro: string;
  similarityScorePct: number;
  latencyFlashMs: number;
  latencyProMs: number;
  passStatus: 'PASS' | 'FAIL' | 'WARNING';
}
