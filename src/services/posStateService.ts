// Enterprise POS State & Store Management Service
import {
  TenantConfig,
  MenuItem,
  Category,
  ModifierGroup,
  Order,
  DiningTable,
  Shift,
  Customer,
  InventoryItem,
  Warehouse,
  PurchaseOrder,
  StockTransfer,
  WasteRecord,
  AuditLog,
  Reservation,
  GiftCard,
  TelemetryMetric,
  OrderItem,
  PaymentMethod,
  User,
  HardwareDevice,
  KitchenStation,
} from '../types';

import { createZatcaInvoicePayload } from '../domain/zatca/zatcaEngine';
import { globalOutbox } from '../domain/crdt/outboxSync';
import { globalHardwareBridge } from '../domain/hardware/hardwareBridge';
import { Money, CurrencyCode } from '../domain/financial/money';
import { VectorClockEngine, OutboxSyncEngine } from '../server/sync/outboxEngine';
import { ZatcaCryptoSigner } from '../domain/zatca/cryptoSigner';
import { globalIndexedDb } from '../domain/persistence/indexedDbStorage';
import {
  EdgeOrderRepository,
  EdgeShiftRepository,
  EdgeInventoryRepository,
  globalEdgeDatabase,
} from '../domain/persistence';
import {
  DoubleEntryEngine,
  AccountingPostingsService,
  FinancialReportingService,
} from '../domain/accounting';
import { ZatcaApiAdapter } from '../domain/zatca';

export const globalOutboxEngine = new OutboxSyncEngine();

/**
 * Calculates order and line item financial totals using arbitrary precision Money value objects.
 * Eliminates IEEE 754 floating-point drift and guarantees exact ZATCA 15% inclusive VAT.
 */
export function calculateOrderTotals(
  items: OrderItem[],
  discountAmount: number = 0,
  taxRate: number = 0.15,
  currency: CurrencyCode = 'SAR'
): {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  calculatedItems: OrderItem[];
} {
  let subtotalMoney = Money.zero(currency);
  
  const calculatedItems = items.map(item => {
    const basePriceMoney = Money.fromMajor(item.unitPrice || 0, currency);
    const modifierTotalMoney = (item.selectedModifiers || []).reduce(
      (acc, mod) => acc.add(Money.fromMajor(mod.price || 0, currency)),
      Money.zero(currency)
    );
    
    const singleUnitPriceMoney = basePriceMoney.add(modifierTotalMoney);
    const lineItemTotalMoney = singleUnitPriceMoney.multiply(item.quantity || 1);
    const itemTaxInfo = lineItemTotalMoney.calculateTax(taxRate, true);
    
    subtotalMoney = subtotalMoney.add(lineItemTotalMoney);

    return {
      ...item,
      totalPrice: lineItemTotalMoney.toNumber(),
      taxAmount: itemTaxInfo.taxAmount.toNumber(),
    };
  });

  const discountMoney = Money.fromMajor(Math.max(0, discountAmount), currency);
  const netPayableMoney = subtotalMoney.greaterThanOrEqual(discountMoney)
    ? subtotalMoney.subtract(discountMoney)
    : Money.zero(currency);

  const orderTaxInfo = netPayableMoney.calculateTax(taxRate, true);

  return {
    subtotal: subtotalMoney.toNumber(),
    discountAmount: discountMoney.toNumber(),
    taxableAmount: orderTaxInfo.taxableBasis.toNumber(),
    taxAmount: orderTaxInfo.taxAmount.toNumber(),
    totalAmount: netPayableMoney.toNumber(),
    calculatedItems,
  };
}

// Initial Mock Seed Data
export const initialTenant: TenantConfig = {
  id: 'tenant-sa-001',
  name: 'Omni Dining Group',
  legalNameEn: 'Omni Gourmet Food Services Ltd.',
  legalNameAr: 'شركة أومني لخدمات الأغذية الراقية المحدودة',
  vatNumber: '310123456700003',
  crNumber: '1010897654',
  groupVatNumber: '310123456700003',
  currency: 'SAR',
  language: 'ar',
  timeZone: 'Asia/Riyadh',
  taxRate: 0.15,
  municipalityFeeRate: 0.05,
  serviceChargeRate: 0.0,
  allowTips: true,
  offlineModeEnabled: true,
  zatcaPhase2Enabled: true,
  zatcaEnvironment: 'sandbox',
  csidStatus: 'ACTIVE',
  branches: [
    {
      id: 'branch-01',
      code: 'RUH-01',
      nameEn: 'Olaya Flagship Branch',
      nameAr: 'فرع العليا الرئيسي',
      addressEn: 'King Fahd Road, Al-Olaya',
      addressAr: 'طريق الملك فهد، حي العليا',
      cityEn: 'Riyadh',
      cityAr: 'الرياض',
      postalCode: '12214',
      districtEn: 'Al-Olaya',
      districtAr: 'العليا',
      buildingNumber: '7234',
      phone: '+966 11 456 7890',
      email: 'olaya@omnipos.sa',
      isMainBranch: true,
      warehouses: ['wh-main', 'wh-kitchen'],
      kitchenStations: [
        { id: 'st-grill', nameEn: 'Grill Station', nameAr: 'محطة الشواء', type: 'GRILL', color: '#ef4444' },
        { id: 'st-fryer', nameEn: 'Fryer Station', nameAr: 'محطة القلي', type: 'FRYER', color: '#f59e0b' },
        { id: 'st-salad', nameEn: 'Salad & Cold Prep', nameAr: 'محطة السلطات والمقبلات', type: 'SALAD', color: '#10b981' },
        { id: 'st-bar', nameEn: 'Beverages & Coffee Bar', nameAr: 'محطة المشروبات والقهوة', type: 'BAR', color: '#6366f1' },
        { id: 'st-expo', nameEn: 'Expo & Dispatch', nameAr: 'محطة التسليم النهائي (Expo)', type: 'EXPO', color: '#8b5cf6' },
      ],
    },
    {
      id: 'branch-02',
      code: 'JED-01',
      nameEn: 'Corniche Waterfront Branch',
      nameAr: 'فرع الواجهة البحرية - جدة',
      addressEn: 'North Corniche Road',
      addressAr: 'طريق الكورنيش الشمالي',
      cityEn: 'Jeddah',
      cityAr: 'جدة',
      postalCode: '23511',
      districtEn: 'Ash Shati',
      districtAr: 'الشاطئ',
      buildingNumber: '4190',
      phone: '+966 12 654 3210',
      email: 'jeddah@omnipos.sa',
      isMainBranch: false,
      warehouses: ['wh-jeddah'],
      kitchenStations: [
        { id: 'st-grill-j', nameEn: 'Grill Station', nameAr: 'محطة الشواء', type: 'GRILL', color: '#ef4444' },
        { id: 'st-fryer-j', nameEn: 'Fryer Station', nameAr: 'محطة القلي', type: 'FRYER', color: '#f59e0b' },
      ],
    },
  ],
};

export const initialCategories: Category[] = [
  { id: 'cat-burgers', nameEn: 'Signature Burgers', nameAr: 'البرجر المميز', icon: 'Flame', color: '#ef4444', sortOrder: 1 },
  { id: 'cat-steaks', nameEn: 'Prime Steaks & Grills', nameAr: 'الستيك والمشاوي', icon: 'Beef', color: '#b91c1c', sortOrder: 2 },
  { id: 'cat-appetizers', nameEn: 'Appetizers & Sides', nameAr: 'المقبلات والبطاطس', icon: 'Utensils', color: '#f59e0b', sortOrder: 3 },
  { id: 'cat-beverages', nameEn: 'Specialty Beverages', nameAr: 'المشروبات المختصة', icon: 'Coffee', color: '#06b6d4', sortOrder: 4 },
  { id: 'cat-desserts', nameEn: 'Artisan Desserts', nameAr: 'الحلويات الفاخرة', icon: 'Cake', color: '#ec4899', sortOrder: 5 },
];

export const initialModifierGroups: ModifierGroup[] = [
  {
    id: 'mod-size',
    nameEn: 'Portion Size',
    nameAr: 'حجم الوجبة',
    minSelect: 1,
    maxSelect: 1,
    isMandatory: true,
    options: [
      { id: 'opt-reg', nameEn: 'Single Regular', nameAr: 'حجم عادي (مفرد)', price: 0, isDefault: true },
      { id: 'opt-dbl', nameEn: 'Double Patty (Large)', nameAr: 'حجم مزدوج (دبل)', price: 14.0 },
      { id: 'opt-trpl', nameEn: 'Triple Beast (XL)', nameAr: 'حجم ثلاثي (وحش)', price: 24.0 },
    ],
  },
  {
    id: 'mod-cooking',
    nameEn: 'Meat Doneness',
    nameAr: 'درجة استواء اللحم',
    minSelect: 1,
    maxSelect: 1,
    isMandatory: true,
    options: [
      { id: 'opt-med-rare', nameEn: 'Medium Rare', nameAr: 'نصف استواء (ميديم رير)', price: 0 },
      { id: 'opt-med', nameEn: 'Medium', nameAr: 'ميديم (متوسط)', price: 0, isDefault: true },
      { id: 'opt-well', nameEn: 'Well Done', nameAr: 'مستوي تماماً (ويل دن)', price: 0 },
    ],
  },
  {
    id: 'mod-addons',
    nameEn: 'Gourmet Add-ons',
    nameAr: 'إضافات مميزة',
    minSelect: 0,
    maxSelect: 4,
    isMandatory: false,
    options: [
      { id: 'opt-cheese', nameEn: 'Smoked Gouda Cheese', nameAr: 'جبنة جودا مدخنة', price: 4.5 },
      { id: 'opt-bacon', nameEn: 'Crispy Beef Bacon', nameAr: 'بيكون بقري مقرمش', price: 6.0 },
      { id: 'opt-truffle-sauce', nameEn: 'Black Truffle Mayo', nameAr: 'صلصة مايونيز الكمأة السوداء', price: 5.0 },
      { id: 'opt-jalapeno', nameEn: 'Caramelized Jalapeños', nameAr: 'هالبينو مكرمل', price: 3.5 },
    ],
  },
  {
    id: 'mod-drink-sugar',
    nameEn: 'Sweetness Level',
    nameAr: 'مستوى السكر',
    minSelect: 1,
    maxSelect: 1,
    isMandatory: true,
    options: [
      { id: 'opt-sugar-0', nameEn: 'No Sugar (0%)', nameAr: 'بدون سكر (0%)', price: 0, isDefault: true },
      { id: 'opt-sugar-50', nameEn: 'Half Sugar (50%)', nameAr: 'سكر خفيف (50%)', price: 0 },
      { id: 'opt-sugar-100', nameEn: 'Regular Sweet (100%)', nameAr: 'سكر عادي (100%)', price: 0 },
    ],
  },
];

export const initialMenuItems: MenuItem[] = [
  {
    id: 'item-wagyu-burger',
    sku: 'BUR-WAG-01',
    barcode: '628100100101',
    nameEn: 'Truffle Wagyu Burger',
    nameAr: 'برجر الواغيو بالكمأة الفاخرة',
    descriptionEn: 'Australian Wagyu beef patty, brioche bun, black truffle aioli, aged cheddar & caramelized onions.',
    descriptionAr: 'شريحة لحم واغيو أسترالي فاخر، خبز بريوش طازج، صلصة أيولي الكمأة، جبن شيدر معتق وبصل مكرمل.',
    categoryId: 'cat-burgers',
    price: 68.0,
    costPrice: 22.5,
    taxRate: 0.15,
    appliesMunicipalityFee: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isKitchenItem: true,
    stationId: 'st-grill',
    modifierGroupIds: ['mod-size', 'mod-cooking', 'mod-addons'],
    calories: 780,
    preparationTimeMinutes: 12,
    recipe: [
      { inventoryItemId: 'inv-beef-wagyu', quantity: 0.18, unit: 'kg', wastePercentage: 5 },
      { inventoryItemId: 'inv-brioche-bun', quantity: 1, unit: 'pcs', wastePercentage: 0 },
      { inventoryItemId: 'inv-truffle-mayo', quantity: 0.03, unit: 'kg', wastePercentage: 2 },
      { inventoryItemId: 'inv-cheddar', quantity: 0.04, unit: 'kg', wastePercentage: 0 },
    ],
  },
  {
    id: 'item-smash-burger',
    sku: 'BUR-SMSH-02',
    barcode: '628100100102',
    nameEn: 'Classic Double Smash Burger',
    nameAr: 'دبل سماش برجر كلاسيك',
    descriptionEn: 'Two seared angus beef patties, secret house sauce, pickles & American melted cheese.',
    descriptionAr: 'شريحتان أنجوس مقرمشة الأطراف، صلصة المطعم السرية، مخلل خيار وجبنة أمريكية ذائبة.',
    categoryId: 'cat-burgers',
    price: 46.0,
    costPrice: 14.0,
    taxRate: 0.15,
    appliesMunicipalityFee: false,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isKitchenItem: true,
    stationId: 'st-grill',
    modifierGroupIds: ['mod-size', 'mod-addons'],
    calories: 690,
    preparationTimeMinutes: 8,
    recipe: [
      { inventoryItemId: 'inv-beef-angus', quantity: 0.15, unit: 'kg', wastePercentage: 4 },
      { inventoryItemId: 'inv-brioche-bun', quantity: 1, unit: 'pcs', wastePercentage: 0 },
      { inventoryItemId: 'inv-cheddar', quantity: 0.04, unit: 'kg', wastePercentage: 0 },
    ],
  },
  {
    id: 'item-ribeye-steak',
    sku: 'STK-RIB-01',
    barcode: '628100100201',
    nameEn: 'Black Angus Ribeye 350g',
    nameAr: 'ستيك ريب آي أنجوس أسود 350 جم',
    descriptionEn: 'Prime grass-fed ribeye steak served with roasted garlic, rosemary butter and truffle jus.',
    descriptionAr: 'قطعة لحم ريب آي أنجوس أسود فاخرة تقدم مع ثوم مشوي، زبدة إكليل الجبل وصلصة الكمأة المركزة.',
    categoryId: 'cat-steaks',
    price: 148.0,
    costPrice: 48.0,
    taxRate: 0.15,
    appliesMunicipalityFee: false,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isKitchenItem: true,
    stationId: 'st-grill',
    modifierGroupIds: ['mod-cooking', 'mod-addons'],
    calories: 890,
    preparationTimeMinutes: 18,
    weighable: true,
    recipe: [
      { inventoryItemId: 'inv-beef-ribeye', quantity: 0.35, unit: 'kg', wastePercentage: 6 },
      { inventoryItemId: 'inv-butter', quantity: 0.03, unit: 'kg', wastePercentage: 0 },
    ],
  },
  {
    id: 'item-truffle-fries',
    sku: 'APP-FRY-01',
    barcode: '628100100301',
    nameEn: 'Parmesan Truffle Fries',
    nameAr: 'بطاطس مقلية بالبارميزان وزيت الكمأة',
    descriptionEn: 'Crispy skin-on golden fries tossed with white truffle oil, grated aged parmesan and fresh parsley.',
    descriptionAr: 'بطاطس ذهبية مقرمشة ممزوجة بزيت الكمأة الأبيض، جبن بارميزان معتق وبقدونس طازج.',
    categoryId: 'cat-appetizers',
    price: 28.0,
    costPrice: 6.5,
    taxRate: 0.15,
    appliesMunicipalityFee: false,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isKitchenItem: true,
    stationId: 'st-fryer',
    modifierGroupIds: ['mod-addons'],
    calories: 450,
    preparationTimeMinutes: 6,
    recipe: [
      { inventoryItemId: 'inv-fries-cut', quantity: 0.22, unit: 'kg', wastePercentage: 3 },
      { inventoryItemId: 'inv-parmesan', quantity: 0.03, unit: 'kg', wastePercentage: 0 },
    ],
  },
  {
    id: 'item-mojito-passion',
    sku: 'BEV-MOJ-01',
    barcode: '628100100401',
    nameEn: 'Passion Fruit Mint Mojito',
    nameAr: 'موهيتو باشن فروت بالنعناع المنعش',
    descriptionEn: 'Fresh passion fruit pulp, crushed mint leaves, sparkling soda, lime and raw cane sugar.',
    descriptionAr: 'لب فاكهة الباشن الطازجة، أوراق نعناع مهروسة، صودا فوارة وليمون طازج.',
    categoryId: 'cat-beverages',
    price: 24.0,
    costPrice: 4.2,
    taxRate: 0.15,
    appliesMunicipalityFee: false,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isKitchenItem: true,
    stationId: 'st-bar',
    modifierGroupIds: ['mod-drink-sugar'],
    calories: 160,
    preparationTimeMinutes: 3,
    recipe: [
      { inventoryItemId: 'inv-passion-syrup', quantity: 0.05, unit: 'l', wastePercentage: 0 },
      { inventoryItemId: 'inv-soda-can', quantity: 1, unit: 'can', wastePercentage: 0 },
    ],
  },
  {
    id: 'item-san-sebastian',
    sku: 'DES-CHE-01',
    barcode: '628100100501',
    nameEn: 'San Sebastian Cheesecake with Belgian Chocolate',
    nameAr: 'تشيز كيك سان سيباستيان بالشوكولاتة البلجيكية',
    descriptionEn: 'Creamy burnt Basque cheesecake served warm with melted Belgian milk chocolate ganache.',
    descriptionAr: 'تشيز كيك الباسك المحروق الشهير بقوام كريمي يقدم دافئاً مع صوص الشوكولاتة البلجيكية.',
    categoryId: 'cat-desserts',
    price: 36.0,
    costPrice: 9.0,
    taxRate: 0.15,
    appliesMunicipalityFee: false,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isKitchenItem: true,
    stationId: 'st-salad',
    modifierGroupIds: [],
    calories: 520,
    preparationTimeMinutes: 4,
    recipe: [
      { inventoryItemId: 'inv-cream-cheese', quantity: 0.12, unit: 'kg', wastePercentage: 2 },
    ],
  },
];

export const initialTables: DiningTable[] = [
  { id: 'tbl-1', number: 'T-01', nameEn: 'Table 1', nameAr: 'طاولة 1', section: 'INDOOR', capacity: 2, status: 'OCCUPIED', currentOrderId: 'ord-active-101', x: 40, y: 50, shape: 'SQUARE', width: 80, height: 80 },
  { id: 'tbl-2', number: 'T-02', nameEn: 'Table 2', nameAr: 'طاولة 2', section: 'INDOOR', capacity: 4, status: 'AVAILABLE', x: 160, y: 50, shape: 'RECTANGLE', width: 110, height: 80 },
  { id: 'tbl-3', number: 'T-03', nameEn: 'Table 3', nameAr: 'طاولة 3', section: 'INDOOR', capacity: 6, status: 'BILL_PRINTED', currentOrderId: 'ord-active-102', x: 300, y: 50, shape: 'RECTANGLE', width: 140, height: 80 },
  { id: 'tbl-4', number: 'T-04', nameEn: 'Table 4 (VIP)', nameAr: 'طاولة 4 (كبار الشخصيات)', section: 'VIP', capacity: 8, status: 'RESERVED', x: 470, y: 50, shape: 'ROUND', width: 110, height: 110 },
  { id: 'tbl-5', number: 'T-05', nameEn: 'Table 5 (Terrace)', nameAr: 'طاولة 5 (الشرفة الخارجية)', section: 'TERRACE', capacity: 4, status: 'AVAILABLE', x: 40, y: 170, shape: 'SQUARE', width: 80, height: 80 },
  { id: 'tbl-6', number: 'T-06', nameEn: 'Table 6 (Terrace)', nameAr: 'طاولة 6 (الشرفة الخارجية)', section: 'TERRACE', capacity: 4, status: 'AVAILABLE', x: 160, y: 170, shape: 'SQUARE', width: 80, height: 80 },
  { id: 'tbl-7', number: 'T-07', nameEn: 'Table 7 (Dirty/Clean)', nameAr: 'طاولة 7 (تحت التنظيف)', section: 'INDOOR', capacity: 2, status: 'DIRTY', x: 300, y: 170, shape: 'SQUARE', width: 80, height: 80 },
];

export const initialWarehouses: Warehouse[] = [
  { id: 'wh-main', branchId: 'branch-01', nameEn: 'Central Raw Material Warehouse', nameAr: 'مستودع المواد الخام الرئيسي', code: 'WH-RUH-MAIN', isPrimary: true, address: 'Building A, Warehouse Zone' },
  { id: 'wh-kitchen', branchId: 'branch-01', nameEn: 'Olaya Kitchen Prep Store', nameAr: 'مستودع المطبخ والتحضير - العليا', code: 'WH-RUH-KTN', isPrimary: false, address: 'Kitchen Storage 1st Floor' },
  { id: 'wh-jeddah', branchId: 'branch-02', nameEn: 'Jeddah Regional Store', nameAr: 'مستودع فرع جدة', code: 'WH-JED-01', isPrimary: true, address: 'Corniche Branch Storage' },
];

export const initialInventoryItems: InventoryItem[] = [
  {
    id: 'inv-beef-wagyu',
    sku: 'RAW-BEEF-WAGYU',
    barcode: '6288001001',
    nameEn: 'Australian Wagyu Minced Beef MB7+',
    nameAr: 'لحم واغيو أسترالي مفروم درجة 7+',
    category: 'Meat & Poultry',
    unit: 'kg',
    costPerUnit: 110.0,
    minStockLevel: 25.0,
    currentStock: { 'wh-main': 65.5, 'wh-kitchen': 18.2, 'wh-jeddah': 40.0 },
    supplierId: 'sup-gourmet-meats',
    batches: [
      { id: 'bat-01', batchNumber: 'WAG-2026-081', warehouseId: 'wh-main', quantity: 65.5, unitCost: 110.0, receivedDate: '2026-08-20', expiryDate: '2026-09-15' },
    ],
  },
  {
    id: 'inv-beef-angus',
    sku: 'RAW-BEEF-ANGUS',
    barcode: '6288001002',
    nameEn: 'Black Angus Minced Chuck/Brisket',
    nameAr: 'لحم أنجوس أسود مفروم شاورما وبرجر',
    category: 'Meat & Poultry',
    unit: 'kg',
    costPerUnit: 48.0,
    minStockLevel: 40.0,
    currentStock: { 'wh-main': 120.0, 'wh-kitchen': 32.5, 'wh-jeddah': 85.0 },
    supplierId: 'sup-gourmet-meats',
    batches: [],
  },
  {
    id: 'inv-beef-ribeye',
    sku: 'RAW-STK-RIBEYE',
    barcode: '6288001003',
    nameEn: 'Prime Angus Ribeye Whole Loins',
    nameAr: 'قطع ريب آي أنجوس كاملة',
    category: 'Meat & Poultry',
    unit: 'kg',
    costPerUnit: 135.0,
    minStockLevel: 15.0,
    currentStock: { 'wh-main': 42.0, 'wh-kitchen': 14.5, 'wh-jeddah': 22.0 },
    supplierId: 'sup-gourmet-meats',
    batches: [],
  },
  {
    id: 'inv-brioche-bun',
    sku: 'BAK-BRIOCHE',
    barcode: '6288002001',
    nameEn: 'Golden Brioche Potato Bun 4.5"',
    nameAr: 'خبز بريوش بطاطس ذهبي 4.5 إنش',
    category: 'Bakery',
    unit: 'pcs',
    costPerUnit: 1.85,
    minStockLevel: 150.0,
    currentStock: { 'wh-main': 600, 'wh-kitchen': 180, 'wh-jeddah': 350 },
    supplierId: 'sup-artisan-bakery',
    batches: [],
  },
  {
    id: 'inv-truffle-mayo',
    sku: 'SAU-TRUFFLE',
    barcode: '6288003001',
    nameEn: 'Italian Black Truffle Mayonnaise',
    nameAr: 'صلصة مايونيز الكمأة السوداء الإيطالية',
    category: 'Sauces & Condiments',
    unit: 'kg',
    costPerUnit: 65.0,
    minStockLevel: 10.0,
    currentStock: { 'wh-main': 28.0, 'wh-kitchen': 8.4, 'wh-jeddah': 15.0 },
    supplierId: 'sup-import-gourmet',
    batches: [],
  },
  {
    id: 'inv-cheddar',
    sku: 'DRY-CHEDDAR',
    barcode: '6288004001',
    nameEn: 'Aged Wisconsin Yellow Cheddar Slices',
    nameAr: 'شرائح جبن شيدر أصفر معتق',
    category: 'Dairy',
    unit: 'kg',
    costPerUnit: 34.0,
    minStockLevel: 20.0,
    currentStock: { 'wh-main': 55.0, 'wh-kitchen': 16.0, 'wh-jeddah': 30.0 },
    supplierId: 'sup-dairy-farm',
    batches: [],
  },
  {
    id: 'inv-fries-cut',
    sku: 'FROZ-FRIES',
    barcode: '6288005001',
    nameEn: 'LambWeston Stealth Skin-On Fries 9mm',
    nameAr: 'بطاطس مقطعة بقشرتها 9 ملم فاخرة',
    category: 'Frozen Foods',
    unit: 'kg',
    costPerUnit: 7.2,
    minStockLevel: 80.0,
    currentStock: { 'wh-main': 240.0, 'wh-kitchen': 45.0, 'wh-jeddah': 180.0 },
    supplierId: 'sup-frozen-logistics',
    batches: [],
  },
  {
    id: 'inv-parmesan',
    sku: 'DRY-PARMIGIANO',
    barcode: '6288004002',
    nameEn: 'Parmigiano Reggiano DOP 24-Month',
    nameAr: 'جبن بارميجانو ريجيانو أصلي 24 شهر',
    category: 'Dairy',
    unit: 'kg',
    costPerUnit: 98.0,
    minStockLevel: 6.0,
    currentStock: { 'wh-main': 18.0, 'wh-kitchen': 4.2, 'wh-jeddah': 10.0 },
    supplierId: 'sup-import-gourmet',
    batches: [],
  },
  {
    id: 'inv-butter',
    sku: 'DRY-BUTTER',
    barcode: '6288004003',
    nameEn: 'French Unsalted Artisan Butter 82%',
    nameAr: 'زبدة فرنسية غير مملحة 82% دسم',
    category: 'Dairy',
    unit: 'kg',
    costPerUnit: 38.0,
    minStockLevel: 12.0,
    currentStock: { 'wh-main': 35.0, 'wh-kitchen': 8.0, 'wh-jeddah': 20.0 },
    supplierId: 'sup-dairy-farm',
    batches: [],
  },
  {
    id: 'inv-passion-syrup',
    sku: 'BEV-PASSION',
    barcode: '6288006001',
    nameEn: 'Monin Passion Fruit Puree & Syrup',
    nameAr: 'سيروب وهريس باشن فروت طبيعي',
    category: 'Beverage Ingredients',
    unit: 'l',
    costPerUnit: 44.0,
    minStockLevel: 15.0,
    currentStock: { 'wh-main': 32.0, 'wh-kitchen': 9.5, 'wh-jeddah': 18.0 },
    supplierId: 'sup-import-gourmet',
    batches: [],
  },
  {
    id: 'inv-soda-can',
    sku: 'BEV-SODA-CAN',
    barcode: '6288006002',
    nameEn: 'Club Soda Cans 250ml',
    nameAr: 'عبوات كلوب صودا فوارة 250 مل',
    category: 'Beverage Ingredients',
    unit: 'can',
    costPerUnit: 1.2,
    minStockLevel: 120.0,
    currentStock: { 'wh-main': 480, 'wh-kitchen': 120, 'wh-jeddah': 300 },
    supplierId: 'sup-beverage-co',
    batches: [],
  },
  {
    id: 'inv-cream-cheese',
    sku: 'DRY-CREAM-CHEESE',
    barcode: '6288004004',
    nameEn: 'Philadelphia Original Cream Cheese',
    nameAr: 'جبن كريمي أصلي فيلادلفيا',
    category: 'Dairy',
    unit: 'kg',
    costPerUnit: 42.0,
    minStockLevel: 15.0,
    currentStock: { 'wh-main': 45.0, 'wh-kitchen': 12.0, 'wh-jeddah': 25.0 },
    supplierId: 'sup-dairy-farm',
    batches: [],
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-01',
    name: 'سلطان بن عبدالعزيز آل سعود',
    phone: '+966 50 123 4567',
    email: 'sultan@enterprise.sa',
    taxNumber: '300998877600003',
    nationalAddress: '7234 King Fahd Rd, Riyadh 12214',
    walletBalance: 450.0,
    loyaltyPoints: 1850,
    loyaltyTier: 'PLATINUM',
    totalSpend: 14850.0,
    visitCount: 42,
    lastVisit: '2026-08-25T21:30:00Z',
    tags: ['VIP', 'High Spender', 'Prefers Table 4'],
  },
  {
    id: 'cust-02',
    name: 'نورة بنت محمد القحطاني',
    phone: '+966 55 987 6543',
    email: 'noura.q@gmail.com',
    walletBalance: 120.0,
    loyaltyPoints: 640,
    loyaltyTier: 'GOLD',
    totalSpend: 4920.0,
    visitCount: 16,
    lastVisit: '2026-08-26T19:15:00Z',
    tags: ['Regular', 'Loves Desserts'],
  },
  {
    id: 'cust-03',
    name: 'شركة الاستشارات المتقدمة',
    phone: '+966 11 234 5678',
    email: 'accounts@adv-consulting.sa',
    taxNumber: '310987654300003',
    nationalAddress: '4190 Olaya Towers, Riyadh',
    walletBalance: 2500.0,
    loyaltyPoints: 3200,
    loyaltyTier: 'PLATINUM',
    totalSpend: 28400.0,
    visitCount: 24,
    lastVisit: '2026-08-24T13:00:00Z',
    tags: ['B2B Corporate', 'Requires Standard Tax Invoice'],
  },
];

export const initialGiftCards: GiftCard[] = [
  { id: 'gc-01', code: 'OMNI-GIFT-500', initialAmount: 500.0, currentBalance: 500.0, issuedToCustomerName: 'سلطان عبدالعزيز', expiresAt: '2027-12-31', isActive: true },
  { id: 'gc-02', code: 'OMNI-GIFT-200', initialAmount: 200.0, currentBalance: 140.0, issuedToCustomerName: 'نورة القحطاني', expiresAt: '2027-06-30', isActive: true },
];

export const initialShift: Shift = {
  id: 'shift-2026-0827-01',
  shiftNumber: 'SH-2026-08-27-01',
  branchId: 'branch-01',
  cashierId: 'usr-cashier-01',
  cashierName: 'فهد العتيبي (Fahad Al-Otaibi)',
  startTime: '2026-08-27T07:00:00Z',
  status: 'OPEN',
  startingCashFloat: 500.0,
  expectedCash: 1240.0,
  actualCashCounted: 1240.0,
  cashDifference: 0.0,
  payIns: [
    { id: 'payin-01', amount: 200.0, type: 'PAY_IN', reason: 'Additional Petty Cash Float', timestamp: '2026-08-27T08:30:00Z', performedBy: 'Store Manager' },
  ],
  payOuts: [
    { id: 'payout-01', amount: 60.0, type: 'PAY_OUT', reason: 'Fresh Herbs Delivery from Local Farmer', timestamp: '2026-08-27T09:45:00Z', performedBy: 'Chef de Partie' },
  ],
  drops: [],
  totalSales: 4850.0,
  cashSales: 1100.0,
  cardSales: 3200.0,
  walletSales: 350.0,
  giftCardSales: 200.0,
  totalVat: 632.6,
  totalDiscounts: 150.0,
  totalRefunds: 0.0,
  totalOrders: 28,
  zReportGenerated: false,
};

export const initialOrders: Order[] = [
  {
    id: 'ord-active-101',
    orderNumber: '#ORD-1048',
    dailySequence: 48,
    tenantId: 'tenant-sa-001',
    branchId: 'branch-01',
    orderType: 'DINE_IN',
    tableId: 'tbl-1',
    tableName: 'طاولة 1',
    guestCount: 2,
    customerId: 'cust-01',
    customerName: 'سلطان بن عبدالعزيز آل سعود',
    items: [
      {
        id: 'ord-item-1',
        menuItemId: 'item-wagyu-burger',
        nameEn: 'Truffle Wagyu Burger',
        nameAr: 'برجر الواغيو بالكمأة الفاخرة',
        unitPrice: 68.0,
        quantity: 2,
        discountAmount: 0,
        taxAmount: 17.74,
        totalPrice: 136.0,
        stationId: 'st-grill',
        stationName: 'محطة الشواء',
        status: 'COOKING',
        selectedModifiers: [
          { groupId: 'mod-cooking', groupName: 'Meat Doneness', optionId: 'opt-med', optionName: 'Medium', price: 0 },
          { groupId: 'mod-addons', groupName: 'Gourmet Add-ons', optionId: 'opt-bacon', optionName: 'Crispy Beef Bacon', price: 6.0 },
        ],
        courseNumber: 2,
      },
      {
        id: 'ord-item-2',
        menuItemId: 'item-truffle-fries',
        nameEn: 'Parmesan Truffle Fries',
        nameAr: 'بطاطس مقلية بالبارميزان وزيت الكمأة',
        unitPrice: 28.0,
        quantity: 1,
        discountAmount: 0,
        taxAmount: 3.65,
        totalPrice: 28.0,
        stationId: 'st-fryer',
        stationName: 'محطة القلي',
        status: 'READY',
        selectedModifiers: [],
        courseNumber: 1,
      },
      {
        id: 'ord-item-3',
        menuItemId: 'item-mojito-passion',
        nameEn: 'Passion Fruit Mint Mojito',
        nameAr: 'موهيتو باشن فروت بالنعناع المنعش',
        unitPrice: 24.0,
        quantity: 2,
        discountAmount: 0,
        taxAmount: 6.26,
        totalPrice: 48.0,
        stationId: 'st-bar',
        stationName: 'محطة المشروبات والقهوة',
        status: 'SERVED',
        selectedModifiers: [],
      },
    ],
    subtotal: 218.0,
    discountAmount: 0,
    taxableAmount: 189.57,
    taxAmount: 28.43,
    municipalityFeeAmount: 0,
    serviceChargeAmount: 0,
    tipAmount: 0,
    totalAmount: 218.0,
    paidAmount: 0,
    balanceAmount: 218.0,
    status: 'PREPARING',
    paymentStatus: 'UNPAID',
    payments: [],
    openedAt: '2026-08-27T10:15:00Z',
    cashierId: 'usr-cashier-01',
    cashierName: 'فهد العتيبي',
    waiterName: 'أحمد السعدي (Waiter)',
    shiftId: 'shift-2026-0827-01',
    zatcaStatus: 'NOT_APPLICABLE',
    zatcaInvoiceType: 'SIMPLIFIED',
    vectorClock: { 'POS-01': 4 },
    version: 1,
  },
];

// In-memory Store Singleton for POS operations
class PosStateManager {
  public currentBranchId: string = 'branch-01';
  public activeUser: User = {
    id: 'usr-admin-01',
    name: 'فهد العتيبي (Super Admin)',
    email: 'fahad@omnipos.sa',
    role: 'SUPER_ADMIN',
    pin: '1234',
    branchId: 'branch-01',
    permissions: ['ALL'],
  };
  public stations: KitchenStation[] = [
    { id: 'st-grill', nameAr: 'محطة المشاوي (Grill Station)', nameEn: 'Grill Station', type: 'GRILL', color: 'orange', printerIp: '192.168.1.201' },
    { id: 'st-bar', nameAr: 'البار والمشروبات (Bar & Drinks)', nameEn: 'Bar Station', type: 'BAR', color: 'indigo', printerIp: '192.168.1.202' },
    { id: 'st-salad', nameAr: 'المقبلات والسلطات (Cold & Salad)', nameEn: 'Salad Station', type: 'SALAD', color: 'emerald', printerIp: '192.168.1.203' },
    { id: 'st-dessert', nameAr: 'الحلويات والكافيه (Dessert Station)', nameEn: 'Dessert Station', type: 'DESSERT', color: 'purple', printerIp: '192.168.1.204' },
  ];
  public devices: HardwareDevice[] = [
    { id: 'dev-prn-01', name: 'Epson TM-T88VI Cashier Thermal', type: 'PRINTER', connectionType: 'ETHERNET', address: '192.168.1.150:9100', isOnline: true },
    { id: 'dev-prn-02', name: 'Kitchen Epson Grill Bixolon', type: 'PRINTER', connectionType: 'ETHERNET', address: '192.168.1.201:9100', isOnline: true, stationId: 'st-grill' },
    { id: 'dev-scale-01', name: 'Toledo RS232 Meat/Produce Scale', type: 'SCALE', connectionType: 'SERIAL', address: 'COM3 /dev/ttyUSB0', isOnline: true },
    { id: 'dev-cfd-01', name: 'Customer Facing Display (VFD 2-Line)', type: 'CUSTOMER_DISPLAY', connectionType: 'USB', address: 'USB://VID_04B8&PID_0202', isOnline: true },
    { id: 'dev-pos-01', name: 'mada EMV NFC Spire Payment Terminal', type: 'PAYMENT_TERMINAL', connectionType: 'ETHERNET', address: '192.168.1.188:8080', isOnline: true },
    { id: 'dev-drawer-01', name: 'APG Heavy Duty Cash Drawer (RJ11 Kick)', type: 'CASH_DRAWER', connectionType: 'USB', address: 'RJ11 via TM-T88VI Pin 2', isOnline: true },
  ];
  public activeOrder: Order | null = null;

  private tenant: TenantConfig = initialTenant;
  private get currency(): CurrencyCode {
    return (this.tenant.currency as CurrencyCode) || 'SAR';
  }
  private categories: Category[] = initialCategories;
  private modifierGroups: ModifierGroup[] = initialModifierGroups;
  private menuItems: MenuItem[] = initialMenuItems;
  private tables: DiningTable[] = initialTables;
  private orders: Order[] = initialOrders;
  private shift: Shift = initialShift;
  private customers: Customer[] = initialCustomers;
  private inventoryItems: InventoryItem[] = initialInventoryItems;
  private warehouses: Warehouse[] = initialWarehouses;
  private giftCards: GiftCard[] = initialGiftCards;
  private auditLogs: AuditLog[] = [];
  private reservations: Reservation[] = [
    {
      id: 'res-01',
      customerName: 'د. خالد الغامدي',
      phone: '+966 54 888 7777',
      partySize: 8,
      reservationTime: '2026-08-27T20:30:00Z',
      tableId: 'tbl-4',
      tableName: 'طاولة 4 (VIP)',
      status: 'CONFIRMED',
      specialRequests: 'Celebrating anniversary, requires flower decoration on table.',
    },
  ];

  private listeners: ((state?: any) => void)[] = [];
  private orderRepo: EdgeOrderRepository = new EdgeOrderRepository(globalEdgeDatabase);
  private shiftRepo: EdgeShiftRepository = new EdgeShiftRepository(globalEdgeDatabase);
  private inventoryRepo: EdgeInventoryRepository = new EdgeInventoryRepository(globalEdgeDatabase);
  private isEdgeStorageReady: boolean = false;

  public accountingEngine: DoubleEntryEngine = new DoubleEntryEngine(initialTenant.id);
  public accountingPostings: AccountingPostingsService = new AccountingPostingsService(this.accountingEngine);
  public financialReporting: FinancialReportingService = new FinancialReportingService(this.accountingEngine);
  public zatcaAdapter: ZatcaApiAdapter = new ZatcaApiAdapter();

  public getState() {
    return {
      tenant: this.tenant,
      currentBranchId: this.currentBranchId,
      activeUser: this.activeUser,
      categories: this.categories,
      modifierGroups: this.modifierGroups,
      menuItems: this.menuItems,
      tables: this.tables,
      orders: this.orders,
      currentShift: this.shift,
      customers: this.customers,
      inventory: this.inventoryItems,
      warehouses: this.warehouses,
      giftCards: this.giftCards,
      reservations: this.reservations,
      auditLogs: this.auditLogs,
      stations: this.stations,
      devices: this.devices,
      activeOrder: this.activeOrder,
    };
  }

  constructor() {
    this.initEdgePersistence();
    this.addAuditLog('SYSTEM_BOOT', 'SECURITY', 'OmniPOS Enterprise Engine Initialized with durable IndexedDB Edge Persistence.');
  }

  public async initEdgePersistence(): Promise<void> {
    try {
      await globalEdgeDatabase.open();
      const tenantId = this.tenant.id;

      // Restore persisted orders from durable IndexedDB
      const persistedOrders = await this.orderRepo.findMany(tenantId);
      if (persistedOrders && persistedOrders.length > 0) {
        this.orders = persistedOrders;
      } else {
        // Seed initial orders into IndexedDB
        for (const o of this.orders) {
          await this.orderRepo.save(tenantId, o).catch(() => {});
        }
      }

      // Restore persisted shifts from durable IndexedDB
      const persistedShifts = await this.shiftRepo.findMany(tenantId);
      if (persistedShifts && persistedShifts.length > 0) {
        const activeShift = persistedShifts.find((s) => s.status === 'OPEN') || persistedShifts[0];
        this.shift = activeShift;
      } else {
        await this.shiftRepo.save(tenantId, this.shift).catch(() => {});
      }

      // Restore persisted inventory from durable IndexedDB
      const persistedInventory = await this.inventoryRepo.findMany(tenantId);
      if (persistedInventory && persistedInventory.length > 0) {
        this.inventoryItems = persistedInventory;
      } else {
        for (const item of this.inventoryItems) {
          await this.inventoryRepo.save(tenantId, item).catch(() => {});
        }
      }

      this.isEdgeStorageReady = true;
      this.notify();
    } catch (e) {
      console.warn('[PosStateManager] Edge IndexedDB initialization notice:', e);
      this.isEdgeStorageReady = true;
    }
  }

  public persist() {
    const tenantId = this.tenant.id;
    // Persist durably to IndexedDB asynchronously without blocking UI render loop
    if (this.orders.length > 0) {
      this.orders.forEach(order => {
        this.orderRepo.save(tenantId, order).catch(err => {
          console.warn('[PosStateManager] Order edge persist error:', err);
        });
      });
    }

    if (this.shift) {
      this.shiftRepo.save(tenantId, this.shift).catch(err => {
        console.warn('[PosStateManager] Shift edge persist error:', err);
      });
    }

    if (this.inventoryItems.length > 0) {
      this.inventoryItems.forEach(item => {
        this.inventoryRepo.save(tenantId, item).catch(err => {
          console.warn('[PosStateManager] Inventory edge persist error:', err);
        });
      });
    }

    this.notify();
  }

  public subscribe(fn: (state?: any) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  // تحديث المستخدم النشط بعد تسجيل الدخول
  public setActiveUser(user: User): void {
    this.activeUser = user;
    this.notify();
  }

  // Getters
  public getTenant(): TenantConfig { return this.tenant; }
  public getCategories(): Category[] { return this.categories; }
  public getModifierGroups(): ModifierGroup[] { return this.modifierGroups; }
  public getMenuItems(): MenuItem[] { return this.menuItems; }
  public getTables(): DiningTable[] { return this.tables; }
  public getOrders(): Order[] { return this.orders; }
  public getShift(): Shift { return this.shift; }
  public getCustomers(): Customer[] { return this.customers; }
  public getInventory(): InventoryItem[] { return this.inventoryItems; }
  public getWarehouses(): Warehouse[] { return this.warehouses; }
  public getGiftCards(): GiftCard[] { return this.giftCards; }
  public getReservations(): Reservation[] { return this.reservations; }
  public getAuditLogs(): AuditLog[] { return this.auditLogs; }

  public setTenantConfig(config: Partial<TenantConfig>) {
    this.tenant = { ...this.tenant, ...config };
    this.notify();
  }

  public addAuditLog(action: string, module: AuditLog['module'], details: string) {
    const prevHash = this.auditLogs.length > 0 ? this.auditLogs[0].hash : 'GENESIS_HASH_0000000000000000';
    const log: AuditLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: 'usr-admin-01',
      userName: 'Administrator / فهد العتيبي',
      action,
      module,
      details,
      ipAddress: '192.168.1.100',
      hash: `HASH-${Date.now().toString(16)}`,
      previousHash: prevHash,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    this.notify();
  }

  // Create or update order with Causal Vector Clocks and Outbox Synchronization
  public saveOrder(order: Order): Order {
    const idx = this.orders.findIndex(o => o.id === order.id);
    
    // Causal Vector Clock progression and versioning
    const currentClock = order.vectorClock || {};
    const updatedClock = VectorClockEngine.tick(currentClock, this.activeUser?.id || 'POS-TERMINAL-01');
    order.vectorClock = updatedClock;
    order.version = (order.version || 0) + 1;

    if (idx >= 0) {
      this.orders[idx] = order;
    } else {
      this.orders.unshift(order);
    }

    // Update table status if dine-in
    if (order.tableId) {
      const tbl = this.tables.find(t => t.id === order.tableId);
      if (tbl) {
        if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
          tbl.status = 'AVAILABLE';
          tbl.currentOrderId = undefined;
        } else {
          tbl.status = order.paymentStatus === 'PAID' ? 'AVAILABLE' : 'OCCUPIED';
          tbl.currentOrderId = order.id;
        }
      }
    }

    // Enqueue into Enterprise Transactional Outbox Sync Engine
    const eventType = idx >= 0 ? 'ORDER_UPDATED' : 'ORDER_CREATED';
    globalOutbox.enqueue(eventType, order.id, order);
    globalOutboxEngine.enqueue(order.tenantId || this.tenant.id, {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      idempotencyKey: `idem-${order.id}-v${order.version}`,
      aggregateId: order.id,
      aggregateType: 'ORDER',
      eventType,
      payload: order,
      vectorClock: order.vectorClock,
      createdAt: new Date().toISOString(),
    }).catch(err => console.warn('Outbox enqueue error:', err));

    this.persist();
    return order;
  }

  // Complete Payment Workflow with ZATCA Phase 2, Money Value Objects & Inventory BOM deduction
  public async processOrderPayment(
    orderId: string,
    paymentMethod: PaymentMethod,
    tenderedAmount: number,
    tipAmount: number = 0,
    cardLast4?: string,
    isB2B?: boolean,
    buyerDetails?: { name: string; vat: string }
  ): Promise<{ order: Order; zatcaResult: any }> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const totalMoney = Money.fromMajor(order.totalAmount, this.currency);
    const existingPaidMoney = Money.fromMajor(order.paidAmount, this.currency);
    const balanceMoney = totalMoney.greaterThan(existingPaidMoney)
      ? totalMoney.subtract(existingPaidMoney)
      : Money.zero(this.currency);

    const tipMoney = Money.fromMajor(tipAmount, this.currency);
    const tenderedMoney = Money.fromMajor(tenderedAmount, this.currency);
    
    // Exact change calculation with Money
    let changeGivenMoney = Money.zero(this.currency);
    if (paymentMethod === 'CASH' && tenderedMoney.greaterThan(balanceMoney)) {
      changeGivenMoney = tenderedMoney.subtract(balanceMoney);
    }

    const paymentTxId = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const tx: any = {
      id: paymentTxId,
      orderId,
      amount: balanceMoney.toNumber(),
      tipAmount: tipMoney.toNumber(),
      method: paymentMethod,
      status: 'APPROVED',
      referenceNumber: `RRN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      cardLastFour: cardLast4 || '4242',
      tenderedCash: paymentMethod === 'CASH' ? tenderedMoney.toNumber() : undefined,
      changeGiven: changeGivenMoney.toNumber(),
      timestamp: new Date().toISOString(),
      cashierId: this.shift.cashierId,
      isOffline: false,
    };

    order.payments.push(tx);
    const updatedPaidMoney = existingPaidMoney.add(balanceMoney);
    order.paidAmount = updatedPaidMoney.toNumber();
    order.balanceAmount = 0;
    order.tipAmount = Money.fromMajor(order.tipAmount, this.currency).add(tipMoney).toNumber();

    order.paymentStatus = 'PAID';
    order.status = 'COMPLETED';
    order.closedAt = new Date().toISOString();

    // Deduct Inventory BOM from Primary Warehouse
    this.deductInventoryForOrder(order);

    // Award Loyalty Points & update CRM
    if (order.customerId) {
      const customer = this.customers.find(c => c.id === order.customerId);
      if (customer) {
        const pointsEarned = Math.floor(order.totalAmount * 1.5);
        customer.loyaltyPoints += pointsEarned;
        customer.totalSpend = Money.fromMajor(customer.totalSpend, this.currency).add(totalMoney).toNumber();
        customer.visitCount += 1;
        customer.lastVisit = new Date().toISOString();

        // Auto Tier Upgrade
        if (customer.totalSpend > 10000) customer.loyaltyTier = 'PLATINUM';
        else if (customer.totalSpend > 4000) customer.loyaltyTier = 'GOLD';
        else if (customer.totalSpend > 1000) customer.loyaltyTier = 'SILVER';

        // If paid with wallet, debit balance safely
        if (paymentMethod === 'WALLET') {
          const walletMoney = Money.fromMajor(customer.walletBalance, this.currency);
          const remainingWallet = walletMoney.greaterThan(balanceMoney)
            ? walletMoney.subtract(balanceMoney)
            : Money.zero(this.currency);
          customer.walletBalance = remainingWallet.toNumber();
        }
      }
    }

    // Update Shift figures using Money precision
    this.shift.totalSales = Money.fromMajor(this.shift.totalSales, this.currency).add(totalMoney).toNumber();
    this.shift.totalVat = Money.fromMajor(this.shift.totalVat, this.currency).add(Money.fromMajor(order.taxAmount, this.currency)).toNumber();
    this.shift.totalDiscounts = Money.fromMajor(this.shift.totalDiscounts, this.currency).add(Money.fromMajor(order.discountAmount, this.currency)).toNumber();
    this.shift.totalOrders += 1;

    if (paymentMethod === 'CASH') {
      this.shift.cashSales = Money.fromMajor(this.shift.cashSales, this.currency).add(balanceMoney).toNumber();
      this.shift.expectedCash = Money.fromMajor(this.shift.expectedCash, this.currency).add(balanceMoney).toNumber();
      globalHardwareBridge.openCashDrawer('Cash Sale Completed');
    } else if (['MADA', 'VISA', 'MASTERCARD', 'APPLE_PAY'].includes(paymentMethod)) {
      this.shift.cardSales = Money.fromMajor(this.shift.cardSales, this.currency).add(balanceMoney).toNumber();
    } else if (paymentMethod === 'WALLET') {
      this.shift.walletSales = Money.fromMajor(this.shift.walletSales, this.currency).add(balanceMoney).toNumber();
    } else if (paymentMethod === 'GIFT_CARD') {
      this.shift.giftCardSales = Money.fromMajor(this.shift.giftCardSales, this.currency).add(balanceMoney).toNumber();
    }

    // Generate ZATCA Phase 2 E-Invoice Cryptographic Payload
    let zatcaResult: any = null;
    try {
      zatcaResult = await createZatcaInvoicePayload({
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        taxAmount: order.taxAmount,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        items: order.items,
        previousInvoiceHash: order.previousInvoiceHash,
        invoiceCounterValue: order.invoiceCounterValue || 1000,
        tenant: this.tenant,
        isB2B: isB2B || false,
        buyerName: buyerDetails?.name,
        buyerVatNumber: buyerDetails?.vat,
      });

      order.zatcaStatus = zatcaResult.status;
      order.invoiceUuid = zatcaResult.uuid;
      order.invoiceHash = zatcaResult.invoiceHash;
      order.previousInvoiceHash = zatcaResult.previousInvoiceHash;
      order.invoiceCounterValue = zatcaResult.invoiceCounterValue;
      order.zatcaQrCodeBase64 = zatcaResult.zatcaQrCodeBase64;
      order.zatcaXmlUbl = zatcaResult.zatcaXmlUbl;
    } catch (err) {
      console.error('ZATCA payload creation error:', err);
      order.zatcaStatus = 'OFFLINE_QUEUED';
    }

    this.saveOrder(order);
    this.addAuditLog('ORDER_PAYMENT', 'POS', `Order ${order.orderNumber} paid ${tx.amount} ${this.currency} via ${paymentMethod}. ZATCA Status: ${order.zatcaStatus}`);

    // Post Automated Double-Entry Journal Entry for Sale
    try {
      this.accountingPostings.postOrderSale({
        tenantId: this.tenant.id,
        branchId: this.currentBranchId,
        orderNumber: order.orderNumber,
        orderId: order.id,
        orderType: order.orderType,
        subtotal: Money.fromMajor(order.subtotal, this.currency),
        discountAmount: Money.fromMajor(order.discountAmount, this.currency),
        taxableAmount: Money.fromMajor(order.taxableAmount, this.currency),
        vatAmount: Money.fromMajor(order.taxAmount, this.currency),
        totalAmount: totalMoney,
        payments: [{ method: paymentMethod as any, amount: balanceMoney }],
        postedBy: this.activeUser?.name || 'POS Cashier',
      });
    } catch (accErr) {
      console.warn('[PosStateManager] Auto accounting posting notice:', accErr);
    }

    // Update Customer Display
    globalHardwareBridge.updateCustomerDisplay('Payment Successful! Thank you.', `Total: ${this.currency} ${order.totalAmount.toFixed(2)}`);

    return { order, zatcaResult };
  }

  // Deduct Inventory BOM
  private deductInventoryForOrder(order: Order) {
    const warehouseId = 'wh-kitchen';
    order.items.forEach(orderItem => {
      const menuItem = this.menuItems.find(m => m.id === orderItem.menuItemId);
      if (!menuItem || !menuItem.recipe) return;

      menuItem.recipe.forEach(recipeItem => {
        const invItem = this.inventoryItems.find(i => i.id === recipeItem.inventoryItemId);
        if (!invItem) return;

        const totalDeduction = recipeItem.quantity * orderItem.quantity * (1 + recipeItem.wastePercentage / 100);
        const currentQty = invItem.currentStock[warehouseId] || 0;
        invItem.currentStock[warehouseId] = Math.max(0, Number((currentQty - totalDeduction).toFixed(3)));
      });
    });
  }

  // Kitchen Display: bump item status
  public updateKitchenItemStatus(orderId: string, itemId: string, nextStatus: OrderItem['status']) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const item = order.items.find(i => i.id === itemId);
    if (item) {
      item.status = nextStatus;
      // If all items ready, update order status
      const allReady = order.items.every(i => i.status === 'READY' || i.status === 'SERVED');
      if (allReady && order.status === 'PREPARING') {
        order.status = 'READY';
      }
      this.saveOrder(order);
      this.addAuditLog('KDS_BUMP', 'KDS', `Item ${item.nameAr || item.nameEn} bumped to ${nextStatus} in order ${order.orderNumber}`);
    }
  }

  // Shift Actions
  public addCashAdjustment(type: 'PAY_IN' | 'PAY_OUT' | 'DROP', amount: number, reason: string) {
    const adj = {
      id: `ADJ-${Date.now()}`,
      amount,
      type,
      reason,
      timestamp: new Date().toISOString(),
      performedBy: 'فهد العتيبي (Cashier)',
    };

    if (type === 'PAY_IN') {
      this.shift.payIns.push(adj);
      this.shift.expectedCash += amount;
    } else if (type === 'PAY_OUT') {
      this.shift.payOuts.push(adj);
      this.shift.expectedCash -= amount;
    } else if (type === 'DROP') {
      this.shift.drops.push(adj);
      this.shift.expectedCash -= amount;
    }

    this.addAuditLog('CASH_ADJUSTMENT', 'SHIFT', `${type} of ${this.currency} ${amount} recorded for reason: ${reason}`);
    this.persist();
  }

  public closeShift(actualCash: number): Shift {
    this.shift.actualCashCounted = actualCash;
    this.shift.cashDifference = actualCash - this.shift.expectedCash;
    this.shift.endTime = new Date().toISOString();
    this.shift.status = 'CLOSED';
    this.shift.zReportGenerated = true;

    // Post Double-Entry Cash Drawer Settlement Discrepancy (if any)
    try {
      this.accountingPostings.postCashDrawerSettlement({
        tenantId: this.tenant.id,
        branchId: this.currentBranchId,
        shiftId: this.shift.id,
        cashierName: this.shift.cashierName,
        expectedCash: Money.fromMajor(this.shift.expectedCash, this.currency),
        actualCashCounted: Money.fromMajor(actualCash, this.currency),
        postedBy: this.activeUser?.name || 'Manager',
      });
    } catch (settleErr) {
      console.warn('[PosStateManager] Shift settlement journal posting notice:', settleErr);
    }

    this.addAuditLog('SHIFT_CLOSE', 'SHIFT', `Shift ${this.shift.shiftNumber} closed with difference of ${this.currency} ${this.shift.cashDifference.toFixed(2)}`);
    this.persist();
    return this.shift;
  }

  // Refund Order & Issue ZATCA Credit Note with Double-Entry Accounting
  public async refundOrder(orderId: string, reason: string, refundMethod: 'CASH' | 'MADA' | 'VISA' | 'WALLET' = 'CASH'): Promise<Order> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const refundNumber = `CN-${order.orderNumber}`;
    order.status = 'CANCELLED';
    order.paymentStatus = 'REFUNDED';

    // Post Accounting Refund Entry
    try {
      this.accountingPostings.postOrderRefund({
        tenantId: this.tenant.id,
        branchId: this.currentBranchId,
        originalOrderNumber: order.orderNumber,
        refundNumber,
        refundId: `ref-${order.id}`,
        refundSubtotal: Money.fromMajor(order.subtotal, this.currency),
        refundVatAmount: Money.fromMajor(order.taxAmount, this.currency),
        refundTotalAmount: Money.fromMajor(order.totalAmount, this.currency),
        refundPaymentMethod: refundMethod,
        reason,
        postedBy: this.activeUser?.name || 'POS Cashier',
      });
    } catch (err) {
      console.warn('[PosStateManager] Refund journal posting notice:', err);
    }

    this.saveOrder(order);
    this.addAuditLog('ORDER_REFUND', 'POS', `Order ${order.orderNumber} refunded (${this.currency} ${order.totalAmount}). Reason: ${reason}`);
    return order;
  }

  // Inventory Management Actions
  public adjustStock(inventoryItemId: string, warehouseId: string, newQuantity: number, reason: string) {
    const item = this.inventoryItems.find(i => i.id === inventoryItemId);
    if (!item) return;

    const oldQty = item.currentStock[warehouseId] || 0;
    item.currentStock[warehouseId] = newQuantity;
    this.addAuditLog('STOCK_ADJUSTMENT', 'INVENTORY', `Adjusted SKU ${item.sku} from ${oldQty} to ${newQuantity} (${reason})`);
    this.persist();
  }

  // Aliases and UI bridge helpers
  public updateTableStatus(tableId: string, status: DiningTable['status']) {
    const tbl = this.tables.find(t => t.id === tableId);
    if (tbl) {
      tbl.status = status;
      this.persist();
    }
  }

  public processPayment = this.processOrderPayment.bind(this);
  public updateItemKitchenStatus = this.updateKitchenItemStatus.bind(this);
  public addDrawerAdjustment = this.addCashAdjustment.bind(this);
  public adjustInventory = this.adjustStock.bind(this);

  public setBranch(branchId: string) {
    this.currentBranchId = branchId;
    this.persist();
  }
}

export const posStore = new PosStateManager();
