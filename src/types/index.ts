// OmniPOS Enterprise SaaS Type Definitions

export type CurrencyCode = 'SAR' | 'USD' | 'AED' | 'KWD' | 'EUR' | 'GBP';
export type LanguageCode = 'en' | 'ar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'CASHIER' | 'CHEF' | 'WAITER' | 'INVENTORY_MANAGER';
  pin: string;
  branchId: string;
  permissions: string[];
}

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'PRINTER' | 'SCALE' | 'CUSTOMER_DISPLAY' | 'BARCODE_SCANNER' | 'PAYMENT_TERMINAL' | 'CASH_DRAWER';
  connectionType: 'ETHERNET' | 'USB' | 'SERIAL' | 'BLUETOOTH';
  address: string;
  isOnline: boolean;
  stationId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export type ToolMode = 'chat' | 'summarize' | 'rewrite' | 'ideas' | 'code' | 'translate' | 'custom';

export interface PromptTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
  prompt: string;
  category: 'daily' | 'work' | 'creative' | 'code';
}

export interface Brand {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  logo: string;
  primaryColor: string;
  active: boolean;
}

export interface LicensePlan {
  id: string;
  planName: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE_PLUS' | 'FRANCHISE';
  maxBranches: number;
  maxTerminals: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  validUntil: string;
  features: string[];
}

export interface TerminalDevice {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  type: 'POS_MAIN' | 'KDS_DISPLAY' | 'WAITER_TABLET' | 'KIOSK' | 'CFD';
  egsSerialNumber: string;
  pairingToken: string;
  ipAddress: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  lastHeartbeat: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  nameEn: string;
  nameAr: string;
  description: string;
  enabled: boolean;
  category: 'CORE' | 'ZATCA' | 'AI' | 'HARDWARE' | 'LOYALTY' | 'SECURITY';
}

export interface ExchangeRate {
  currency: CurrencyCode;
  rateToSar: number;
  symbol: string;
  lastUpdated: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  legalNameEn: string;
  legalNameAr: string;
  vatNumber: string; // 15-digit ZATCA VAT number
  crNumber: string; // Commercial Registration
  groupVatNumber?: string;
  currency: CurrencyCode;
  language: LanguageCode;
  timeZone: string;
  taxRate: number; // e.g. 0.15 (15%)
  municipalityFeeRate: number; // e.g. 0.05 (5%) for tobacco / special dining
  serviceChargeRate: number;
  allowTips: boolean;
  offlineModeEnabled: boolean;
  zatcaPhase2Enabled: boolean;
  zatcaEnvironment: 'sandbox' | 'simulation' | 'production';
  csidStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  zatcaConfig?: {
    egsSerialNumber?: string;
    certificateExpiry?: string;
    csrGenerated?: boolean;
    complianceChecksPassed?: boolean;
  };
  branches: Branch[];
  brands?: Brand[];
  license?: LicensePlan;
  featureFlags?: FeatureFlag[];
}

export interface Branch {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  cityEn: string;
  cityAr: string;
  city?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  crNumber?: string;
  postalCode: string;
  districtEn: string;
  districtAr: string;
  buildingNumber: string;
  phone: string;
  email: string;
  isMainBranch: boolean;
  kitchenStations: KitchenStation[];
  warehouses: string[]; // Warehouse IDs
}

export interface KitchenStation {
  id: string;
  nameEn: string;
  nameAr: string;
  printerIp?: string;
  type: 'GRILL' | 'FRYER' | 'SALAD' | 'DESSERT' | 'EXPO' | 'BAR' | 'PIZZA';
  color: string;
}

export interface Warehouse {
  id: string;
  branchId: string;
  nameEn: string;
  nameAr: string;
  code: string;
  isPrimary: boolean;
  address: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string;
  nameEn: string;
  nameAr: string;
  category: string;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'box' | 'can';
  costPerUnit: number;
  minStockLevel: number;
  currentStock: Record<string, number>; // warehouseId -> quantity
  supplierId: string;
  batches: StockBatch[];
  costingMethod?: 'FIFO' | 'FEFO' | 'MOVING_AVERAGE';
}

export interface StockBatch {
  id: string;
  batchNumber: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  receivedDate: string;
  expiryDate: string;
}

export interface RecipeItem {
  inventoryItemId: string;
  quantity: number; // In the unit of inventory item
  unit: string;
  wastePercentage: number;
}

export type Allergen =
  | 'GLUTEN'
  | 'DAIRY'
  | 'EGGS'
  | 'NUTS'
  | 'PEANUTS'
  | 'SOY'
  | 'FISH'
  | 'SHELLFISH'
  | 'SESAME'
  | 'MUSTARD';

export interface NutritionFact {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sodiumMg: number;
}

export interface ComboStepOption {
  menuItemId: string;
  nameEn: string;
  nameAr: string;
  additionalPrice: number;
}

export interface ComboStep {
  id: string;
  nameEn: string;
  nameAr: string;
  minSelect: number;
  maxSelect: number;
  options: ComboStepOption[];
}

export interface MenuItem {
  id: string;
  sku: string;
  barcode?: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categoryId: string;
  price: number;
  costPrice: number;
  taxRate: number; // 0.15 standard
  appliesMunicipalityFee: boolean;
  image: string;
  isAvailable: boolean;
  isKitchenItem: boolean;
  stationId: string; // Kitchen station
  modifierGroupIds: string[];
  recipe: RecipeItem[];
  calories?: number;
  preparationTimeMinutes: number;
  weighable?: boolean; // For scales
  allergens?: Allergen[];
  nutrition?: NutritionFact;
  isCombo?: boolean;
  comboSteps?: ComboStep[];
  happyHourPrice?: number;
}

export interface MenuVersion {
  id: string;
  versionNumber: string;
  name: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  publishedAt: string;
  changesSummary: string;
  itemCount: number;
}

export interface MenuSchedule {
  id: string;
  nameEn: string;
  nameAr: string;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon ...
  startTime: string; // "14:00"
  endTime: string; // "18:00"
  priceDiscountPercent: number;
  isHappyHour: boolean;
  active: boolean;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface ModifierOption {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  recipe?: RecipeItem[];
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  nameEn: string;
  nameAr: string;
  minSelect: number;
  maxSelect: number;
  isMandatory: boolean;
  options: ModifierOption[];
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'DRIVE_THRU' | 'KIOSK' | 'QR_ORDER';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  nameEn: string;
  nameAr: string;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number; // (unitPrice * qty) - discount + tax
  stationId: string;
  stationName: string;
  status: 'QUEUED' | 'COOKING' | 'READY' | 'SERVED';
  selectedModifiers: SelectedModifier[];
  seatNumber?: number;
  courseNumber?: number; // 1 = Starter, 2 = Main, 3 = Dessert
  firedAt?: string;
  specialInstructions?: string;
}

export type PaymentMethod = 'CASH' | 'MADA' | 'VISA' | 'MASTERCARD' | 'APPLE_PAY' | 'WALLET' | 'GIFT_CARD' | 'SPLIT';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  tipAmount: number;
  method: PaymentMethod;
  status: 'APPROVED' | 'PENDING' | 'DECLINED' | 'REFUNDED';
  referenceNumber: string; // Auth code / RRN
  cardLastFour?: string;
  tenderedCash?: number;
  changeGiven?: number;
  timestamp: string;
  cashierId: string;
  isOffline: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #ORD-1049
  dailySequence: number; // e.g. 49
  tenantId: string;
  branchId: string;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  guestCount: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | 'COUPON';
  discountReason?: string;
  taxableAmount: number;
  taxAmount: number; // VAT
  municipalityFeeAmount: number;
  serviceChargeAmount: number;
  tipAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payments: PaymentTransaction[];
  openedAt: string;
  closedAt?: string;
  cashierId: string;
  cashierName: string;
  waiterName?: string;
  shiftId: string;
  notes?: string;
  // ZATCA Fields
  zatcaStatus: 'REPORTED' | 'CLEARED' | 'OFFLINE_QUEUED' | 'REJECTED' | 'NOT_APPLICABLE';
  zatcaInvoiceType: 'SIMPLIFIED' | 'STANDARD'; // B2C vs B2B
  invoiceUuid?: string;
  invoiceHash?: string;
  previousInvoiceHash?: string;
  invoiceCounterValue?: number;
  zatcaQrCodeBase64?: string;
  zatcaXmlUbl?: string;
  vectorClock: Record<string, number>;
  version: number;
}

export interface DiningTable {
  id: string;
  number: string;
  nameEn: string;
  nameAr: string;
  section: 'INDOOR' | 'OUTDOOR' | 'VIP' | 'TERRACE' | 'BAR';
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILL_PRINTED' | 'DIRTY';
  currentOrderId?: string;
  x: number; // Floor plan coordinates
  y: number;
  shape: 'RECTANGLE' | 'ROUND' | 'SQUARE';
  width: number;
  height: number;
  isLocked?: boolean;
  lockedBy?: string;
  diningStartTimestamp?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  reservationTime: string;
  tableId?: string;
  tableName?: string;
  status: 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';
  specialRequests?: string;
  depositAmount?: number;
  isVip?: boolean;
}

export interface WaitlistEntry {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  joinedAt: string;
  estimatedWaitMins: number;
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'CANCELLED';
  buzzerNumber?: string;
}

export interface Shift {
  id: string;
  shiftNumber: string;
  tenantId?: string;
  branchId: string;
  terminalId?: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  status: 'OPEN' | 'CLOSED';
  startingCashFloat: number;
  expectedCash: number;
  actualCashCounted: number;
  cashDifference: number; // actual - expected
  payIns: CashAdjustment[];
  payOuts: CashAdjustment[];
  drops: CashAdjustment[];
  totalSales: number;
  cashSales: number;
  cardSales: number;
  walletSales: number;
  giftCardSales: number;
  totalVat: number;
  totalDiscounts: number;
  totalRefunds: number;
  totalOrders: number;
  zReportGenerated: boolean;
}

export interface CashAdjustment {
  id: string;
  amount: number;
  type: 'PAY_IN' | 'PAY_OUT' | 'DROP';
  reason: string;
  timestamp: string;
  performedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  taxNumber?: string; // For B2B
  nationalAddress?: string;
  walletBalance: number;
  loyaltyPoints: number;
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalSpend: number;
  visitCount: number;
  lastVisit: string;
  tags: string[];
  birthDate?: string;
  rfmSegment?: 'CHAMPIONS' | 'LOYAL' | 'POTENTIAL' | 'AT_RISK' | 'LOST';
  isVip?: boolean;
  notes?: string;
  favoriteDishes?: string[];
}

export interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  currentBalance: number;
  initialBalance?: number;
  issuedToCustomerName?: string;
  recipientName?: string;
  expiresAt: string;
  isActive: boolean;
  status?: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
}

export interface CouponPromo {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageCount: number;
  maxUsageLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CustomerTimelineEvent {
  id: string;
  customerId: string;
  timestamp: string;
  type: 'ORDER_PLACED' | 'WALLET_TOPUP' | 'POINTS_EARNED' | 'REWARD_REDEEMED' | 'RESERVATION' | 'FEEDBACK';
  description: string;
  amount?: number;
}

export interface Supplier {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  contactPerson: string;
  phone: string;
  email: string;
  vatNumber: string;
  paymentTerms: string;
  leadTimeDays: number;
  rating: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  targetWarehouseId: string;
  targetWarehouseName: string;
  items: {
    inventoryItemId: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  approvedBy?: string;
}

export interface WasteRecord {
  id: string;
  inventoryItemId: string;
  itemName: string;
  warehouseId: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: 'EXPIRED' | 'DAMAGED' | 'SPOILAGE' | 'PREPARATION_ERROR' | 'BURNT';
  reportedBy: string;
  createdAt: string;
}

export interface CentralKitchenProductionOrder {
  id: string;
  batchNumber: string;
  recipeNameEn: string;
  recipeNameAr: string;
  outputInventoryItemId: string;
  outputName: string;
  plannedQuantity: number;
  actualProducedQuantity: number;
  unit: string;
  ingredients: {
    inventoryItemId: string;
    name: string;
    requiredQty: number;
    actualUsedQty: number;
    unitCost: number;
  }[];
  totalBatchCost: number;
  status: 'PLANNED' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  productionDate: string;
  operatorName: string;
}

export interface CycleCount {
  id: string;
  warehouseId: string;
  warehouseName: string;
  countDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'RECONCILED';
  countedBy: string;
  items: {
    inventoryItemId: string;
    name: string;
    systemQty: number;
    physicalCountQty: number;
    varianceQty: number;
    unitCost: number;
    varianceValue: number;
  }[];
}

export interface Employee {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  role: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'HEAD_CHEF' | 'LINE_COOK' | 'CASHIER' | 'SERVER' | 'INVENTORY_LEAD';
  branchId: string;
  branchName: string;
  hourlyRate: number;
  monthlySalary: number;
  phone: string;
  email: string;
  nationalId: string;
  joinDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  biometricEnrolled: boolean;
  performanceRating: number;
  avgTurnTimeMins?: number;
  totalSalesVolume?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakDurationMins: number;
  totalHours: number;
  verificationMethod: 'FACE_ID' | 'FINGERPRINT' | 'PIN_PAD' | 'MANUAL_OVERRIDE';
  status: 'ON_TIME' | 'LATE' | 'OVERTIME' | 'ABSENT';
}

export interface ShiftRosterItem {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  date: string;
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT' | 'SPLIT';
  startTime: string;
  endTime: string;
}

export interface TipsPoolDistribution {
  id: string;
  shiftId: string;
  shiftNumber: string;
  totalTipsCollected: number;
  distributionMethod: 'HOURS_WORKED' | 'POINTS_BY_ROLE' | 'EQUAL_SPLIT';
  distributedDate: string;
  allocations: {
    employeeId: string;
    employeeName: string;
    role: string;
    hours: number;
    allocatedAmount: number;
  }[];
}

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'COGS';

export interface ChartOfAccount {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  category: AccountCategory;
  type?: AccountCategory;
  subCategory: string;
  balance: number;
  currency: CurrencyCode;
  isReconciled: boolean;
}

export interface JournalLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  branchId: string;
  memo: string;
  description?: string;
  lines: JournalLine[];
  postedBy: string;
  isPosted: boolean;
}

export interface VatReturnSummary {
  period: string;
  standardRatedSalesSar: number;
  standardRatedOutputVatSar: number;
  standardRatedPurchasesSar: number;
  standardRatedInputVatSar?: number;
  inputVatDeductibleSar: number;
  netVatDueSar?: number;
  netVatPayableSar: number;
  zatcaStatus: 'FILED' | 'PENDING' | 'RECONCILED';
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  keyMasked: string;
  scopes: string[];
  rateLimitPerMin: number;
  createdAt: string;
  lastUsedAt?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface WebhookSubscription {
  id: string;
  url: string;
  eventTypes: string[];
  secret: string;
  status: 'ACTIVE' | 'PAUSED';
  successCount: number;
  failureCount: number;
  lastDeliveredAt?: string;
}

export interface RbacPolicy {
  id: string;
  role: string;
  resource: string;
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE')[];
  condition?: string;
}

export interface SecurityThreatAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatType: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
}

export interface InfraClusterMetric {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  pods: number;
  cpuPercent: number;
  memoryMb: number;
  latencyP99Ms: number;
}

export interface TestCaseResult {
  id: string;
  category: 'UNIT' | 'INTEGRATION' | 'ZATCA_E2E' | 'CRDT_OFFLINE' | 'SECURITY_OPA';
  name: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  errorDetails?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: 'POS' | 'KDS' | 'INVENTORY' | 'SHIFT' | 'SECURITY' | 'ZATCA' | 'CRM' | 'SETTINGS' | 'ACCOUNTING' | 'HR' | 'MENU';
  category?: string;
  details: string;
  ipAddress: string;
  hash: string;
  previousHash: string;
}

export interface TelemetryMetric {
  name: string;
  value: number;
  unit: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// ==========================================
// 1. PROCUREMENT & VENDOR MANAGEMENT
// ==========================================
export interface VendorSupplier {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  category: 'RAW_FOOD' | 'BEVERAGES' | 'PACKAGING' | 'EQUIPMENT' | 'CHEMICALS' | 'SERVICES';
  contactPerson: string;
  email: string;
  phone: string;
  vatNumber: string;
  crNumber: string;
  paymentTerms: 'NET_15' | 'NET_30' | 'NET_60' | 'COD' | 'ADVANCE';
  currency: CurrencyCode;
  ratingScore: number; // 1.0 - 5.0
  onTimeDeliveryRate: number; // Percentage e.g. 98%
  qualityComplianceRate: number; // Percentage e.g. 99%
  status: 'APPROVED' | 'ON_HOLD' | 'BLOCKED';
  leadTimeDays: number;
  contractExpiryDate: string;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  branchId: string;
  requestedBy: string;
  requiredDate: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PO_CONVERTED';
  totalEstimatedCostSar: number;
  items: {
    inventoryItemId: string;
    itemNameEn: string;
    itemNameAr: string;
    requestedQty: number;
    unit: string;
    estimatedUnitPrice: number;
  }[];
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  branchId: string;
  warehouseId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'ISSUED' | 'PARTIALLY_RECEIVED' | 'FULFILLED' | 'CANCELLED';
  currency: CurrencyCode;
  exchangeRate: number;
  subtotal: number;
  taxAmount: number;
  landedFreightCost: number;
  landedCustomsCost: number;
  totalAmountSar: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  items: {
    inventoryItemId: string;
    itemNameEn: string;
    itemNameAr: string;
    orderedQty: number;
    receivedQty: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    taxRate: number;
  }[];
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  receivedDate: string;
  receivedBy: string;
  warehouseId: string;
  status: 'ACCEPTED' | 'ACCEPTED_WITH_VARIANCE' | 'REJECTED';
  temperatureAtReceiptCelsius?: number;
  expiryCheckPassed: boolean;
  items: {
    inventoryItemId: string;
    orderedQty: number;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    batchNumber: string;
    expiryDate: string;
    rejectionReason?: string;
  }[];
}

export interface ThreeWayInvoiceMatch {
  id: string;
  supplierInvoiceNumber: string;
  poNumber: string;
  grnNumber: string;
  invoiceDate: string;
  supplierTotalAmountSar: number;
  poTotalAmountSar: number;
  grnTotalAmountSar: number;
  priceVariance: number;
  qtyVariance: number;
  matchStatus: 'EXACT_MATCH' | 'TOLERANCE_ACCEPTED' | 'DISCREPANCY_FLAGGED';
  autoApprovedForPayment: boolean;
}

// ==========================================
// 2. FRANCHISE & MULTI-UNIT MANAGEMENT
// ==========================================
export interface Franchisee {
  id: string;
  agreementNumber: string;
  legalEntityName: string;
  territoryRegion: string;
  royaltyFeePercent: number; // e.g. 5.0%
  marketingFundFeePercent: number; // e.g. 2.0%
  assignedBranches: string[];
  contractStartDate: string;
  contractExpiryDate: string;
  complianceScorePercent: number; // e.g. 96%
  status: 'ACTIVE' | 'AUDIT_REQUIRED' | 'SUSPENDED';
  totalRevenueYtdSar: number;
  royaltiesDueSar: number;
}

export interface CorporateMenuDistribution {
  id: string;
  templateName: string;
  targetRegions: string[];
  targetBranches: string[];
  version: string;
  effectiveDate: string;
  priceAdjustmentType: 'PERCENT_INCREASE' | 'PERCENT_DECREASE' | 'EXACT_OVERRIDE';
  priceAdjustmentValue: number;
  status: 'PUBLISHED' | 'STAGED' | 'DRAFT';
}

// ==========================================
// 3. DELIVERY & FLEET LOGISTICS
// ==========================================
export interface DeliveryZone {
  id: string;
  nameEn: string;
  nameAr: string;
  branchId: string;
  radiusKm: number;
  baseDeliveryFeeSar: number;
  minimumOrderSar: number;
  estimatedTimeMin: number;
  isActive: boolean;
  coordinatesPolygon?: { lat: number; lng: number }[];
}

export interface DeliveryDriver {
  id: string;
  code: string;
  name: string;
  phone: string;
  vehicleType: 'MOTORCYCLE' | 'CAR' | 'VAN';
  licensePlate: string;
  currentStatus: 'IDLE' | 'ASSIGNED' | 'PICKING_UP' | 'ON_THE_WAY' | 'OFFLINE';
  assignedOrderId?: string;
  currentLocation: { lat: number; lng: number; heading: number };
  rating: number;
  completedDeliveriesToday: number;
  cashCollectedSar: number;
  batteryLevelPercent: number;
}

export interface DeliveryOrderPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  coordinates: { lat: number; lng: number };
  driverId?: string;
  driverName?: string;
  status: 'UNASSIGNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'FAILED';
  estimatedArrivalTimestamp: string;
  proofOfDeliveryPhotoUrl?: string;
  otpCode: string;
}

// ==========================================
// 4. CENTRAL KITCHEN & PRODUCTION
// ==========================================
export interface ManufacturingOrder {
  id: string;
  moNumber: string;
  centralKitchenBranchId: string;
  recipeId: string;
  recipeName: string;
  scheduledDate: string;
  targetOutputQty: number;
  unit: string;
  status: 'PLANNED' | 'IN_PREPARATION' | 'COOKING' | 'QUALITY_CHECK' | 'COMPLETED';
  actualOutputYieldQty: number;
  wastePercentage: number;
  totalCostSar: number;
  costPerUnitSar: number;
  ingredientsUsed: {
    inventoryItemId: string;
    itemName: string;
    requiredQty: number;
    actualQty: number;
    unit: string;
  }[];
  destinationBranchAllocations: {
    branchId: string;
    branchName: string;
    allocatedQty: number;
    transferStatus: 'PENDING' | 'DISPATCHED' | 'RECEIVED';
  }[];
}

// ==========================================
// 5. WORKFLOW & SAGA ORCHESTRATION
// ==========================================
export interface WorkflowTask {
  id: string;
  processType: 'PURCHASE_APPROVAL' | 'VOID_REFUND_ESCALATION' | 'PRICE_CHANGE' | 'LEAVE_APPROVAL' | 'MENU_PUBLISH';
  referenceId: string;
  titleEn: string;
  titleAr: string;
  initiatedBy: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  currentStep: number;
  totalSteps: number;
  approvalChain: {
    role: string;
    approverName?: string;
    status: 'WAITING' | 'APPROVED' | 'REJECTED';
    actionTimestamp?: string;
    comments?: string;
  }[];
  slaDueTimestamp: string;
}

export interface SagaTransaction {
  sagaId: string;
  type: 'ORDER_FULFILLMENT_SAGA' | 'INVENTORY_RESERVATION_SAGA' | 'ZATCA_SUBMISSION_SAGA';
  status: 'EXECUTING' | 'COMMITTED' | 'COMPENSATED' | 'FAILED';
  steps: {
    stepName: string;
    status: 'SUCCESS' | 'FAILED' | 'COMPENSATED';
    payload: Record<string, any>;
    compensationAction?: string;
  }[];
}

// ==========================================
// 6. SAAS BILLING & USAGE METERING
// ==========================================
export interface TenantBillingPlan {
  tenantId: string;
  planTier: 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'FRANCHISE_GLOBAL';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  monthlyBasePriceSar: number;
  activeBranchesCount: number;
  branchPriceSar: number;
  activeTerminalsCount: number;
  terminalPriceSar: number;
  zatcaInvoicesMonthlyLimit: number;
  zatcaInvoicesUsedThisMonth: number;
  storageMbUsed: number;
  storageMbLimit: number;
  currentInvoiceDueSar: number;
  nextRenewalDate: string;
  paymentMethodMasked: string; // e.g. Mada **** 8821
  autoDebitEnabled: boolean;
}

// ==========================================
// 7. AI PREDICTIVE INTELLIGENCE
// ==========================================
export interface AiDemandForecast {
  date: string;
  predictedSalesSar: number;
  actualSalesSar?: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  predictedCoversCount: number;
  weatherFactor: 'SUNNY' | 'HOT_WIND' | 'RAIN' | 'HOLIDAY_RUSH';
  recommendedStaffCount: number;
  reorderAlerts: {
    inventoryItemId: string;
    itemName: string;
    currentStock: number;
    predictedUsage24h: number;
    recommendedOrderQty: number;
    urgency: 'HIGH' | 'MEDIUM';
  }[];
}

export interface AiFraudAnomaly {
  id: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  detectionTimestamp: string;
  cashierName: string;
  branchName: string;
  anomalyType: 'HIGH_CONSECUTIVE_DRAWER_OPENS_NO_SALE' | 'UNUSUAL_VOID_AFTER_RECEIPT_PRINT' | 'EXCESSIVE_LINE_ITEM_DISCOUNT' | 'OFFLINE_TIMESTAMP_DRIFT';
  confidenceScorePercent: number;
  description: string;
  actionTaken: 'FLAGGED_FOR_AUDIT' | 'MANAGER_PIN_REQUIRED';
}

// ==========================================
// 8. DISASTER RECOVERY & HA
// ==========================================
export interface ClusterRegionStatus {
  regionId: string;
  regionName: string;
  location: string;
  role: 'PRIMARY_ACTIVE' | 'SECONDARY_HOT_STANDBY' | 'DISASTER_RECOVERY_COLD';
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  replicationLagMs: number;
  qps: number;
  healthScorePercent: number;
  lastSnapshotVerified: string;
  rpoSeconds: number;
  rtoSeconds: number;
}

// ==========================================
// 9. ENTERPRISE INTEGRATION MARKETPLACE
// ==========================================
export interface IntegrationConnector {
  id: string;
  name: string;
  category: 'FOOD_DELIVERY' | 'ERP' | 'ACCOUNTING' | 'PAYMENT_GATEWAY' | 'LOYALTY_AGGREGATOR';
  icon: string;
  descriptionEn: string;
  descriptionAr: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONFIG_REQUIRED';
  eventsProcessedToday: number;
  lastSyncTimestamp: string;
  configFields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'select';
    value: string;
  }[];
}

// ==========================================
// 10. ENTERPRISE PRODUCTION SUITE TYPES
// ==========================================
export * from './production';

