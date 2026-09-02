// خريطة صلاحيات الأدوار — تعريفات فقط، لا ترتبط بأي شاشة بعد

import type { User } from '../types';

export type UserRole = User['role'];
// 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'CASHIER' | 'CHEF' | 'WAITER' | 'INVENTORY_MANAGER'

// ============================================================
// خريطة التنقل حسب الدور (بأسماء NavModule الحقيقية)
// ============================================================

// كل شاشات النظام (34) — للمالك
const ALL_NAV_MODULES = [
  'V2_OPERATIONS', 'SAAS_PLATFORM', 'COGNITIVE_AI', 'AI_AGENTS', 'AI_APPS',
  'AI_FOUNDATION', 'SPRINT1_FOUNDATION', 'RUNTIME_OPS', 'POS', 'FLOOR_PLAN',
  'KDS', 'SHIFTS', 'MENU', 'INVENTORY', 'PROCUREMENT', 'CUSTOMERS', 'DELIVERY',
  'CENTRAL_KITCHEN', 'FRANCHISE', 'HR', 'ACCOUNTING', 'WORKFLOW', 'AI_SERVICES',
  'INTEGRATIONS', 'SAAS_BILLING', 'DISASTER_RECOVERY', 'PRODUCTION', 'ZATCA',
  'ANALYTICS', 'SECURITY', 'HARDWARE', 'ADMIN', 'TESTS', 'SETTINGS',
] as const;

// أي شاشات يشوفها كل دور في القائمة
export const ROLE_NAV_MODULES: Record<UserRole, readonly string[]> = {
  SUPER_ADMIN: ALL_NAV_MODULES,
  BRANCH_MANAGER: [
    'POS', 'FLOOR_PLAN', 'KDS', 'SHIFTS', 'MENU', 'INVENTORY', 'PROCUREMENT',
    'CUSTOMERS', 'DELIVERY', 'HR', 'ACCOUNTING', 'ANALYTICS', 'ZATCA', 'SETTINGS',
  ],
  CASHIER: ['POS', 'FLOOR_PLAN', 'SHIFTS'],
  CHEF: ['KDS'],
  WAITER: ['FLOOR_PLAN', 'POS'],
  INVENTORY_MANAGER: ['INVENTORY', 'PROCUREMENT', 'CENTRAL_KITCHEN', 'ANALYTICS'],
};

// هل الدور ده يقدر يوصل للشاشة دي؟ (بأسماء NavModule)
export function canAccessNav(role: UserRole, moduleId: string): boolean {
  const allowed = ROLE_NAV_MODULES[role];
  if (!allowed) return false;
  return allowed.includes(moduleId);
}

// أول شاشة مسموحة للدور (نبدأ عندها بعد الدخول)
export function firstAllowedNav(role: UserRole): string {
  const allowed = ROLE_NAV_MODULES[role];
  return allowed && allowed.length > 0 ? allowed[0] : 'POS';
}

// الأفعال الحساسة اللي بنتحكم فيها بالدور
export interface RoleActions {
  canVoidInvoice: boolean;      // إلغاء/تعديل فاتورة
  canApplyDiscount: boolean;    // تطبيق خصم
  canCloseShift: boolean;       // إغلاق الوردية
  canManageUsers: boolean;      // إدارة المستخدمين والأدوار
  canViewReports: boolean;      // عرض التقارير المالية
  canManageInventory: boolean;  // إدارة المخزون
}

export interface RoleDefinition {
  labelAr: string;
  labelEn: string;
  modules: string[] | 'ALL';    // أي شاشات مسموح بيها ('ALL' = الكل)
  actions: RoleActions;
}

// الشاشات التشغيلية الأساسية (نوسّعها بعدين حسب الحاجة)
export const OPERATIONAL_MODULES = {
  POS: 'pos',
  KDS: 'kds',              // شاشة المطبخ
  TABLES: 'tables',        // الطاولات (للويتر)
  INVENTORY: 'inventory',
  REPORTS: 'reports',
  ACCOUNTING: 'accounting',
  USERS: 'users',
  SETTINGS: 'settings',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, RoleDefinition> = {
  SUPER_ADMIN: {
    labelAr: 'مالك النظام',
    labelEn: 'Super Admin',
    modules: 'ALL',
    actions: {
      canVoidInvoice: true,
      canApplyDiscount: true,
      canCloseShift: true,
      canManageUsers: true,
      canViewReports: true,
      canManageInventory: true,
    },
  },
  BRANCH_MANAGER: {
    labelAr: 'مدير الفرع',
    labelEn: 'Branch Manager',
    modules: [
      OPERATIONAL_MODULES.POS,
      OPERATIONAL_MODULES.KDS,
      OPERATIONAL_MODULES.TABLES,
      OPERATIONAL_MODULES.INVENTORY,
      OPERATIONAL_MODULES.REPORTS,
      OPERATIONAL_MODULES.ACCOUNTING,
      OPERATIONAL_MODULES.SETTINGS,
    ],
    actions: {
      canVoidInvoice: true,
      canApplyDiscount: true,
      canCloseShift: true,
      canManageUsers: false,
      canViewReports: true,
      canManageInventory: true,
    },
  },
  CASHIER: {
    labelAr: 'كاشير',
    labelEn: 'Cashier',
    modules: [
      OPERATIONAL_MODULES.POS,
      OPERATIONAL_MODULES.TABLES,
    ],
    actions: {
      canVoidInvoice: false,
      canApplyDiscount: false,
      canCloseShift: false,
      canManageUsers: false,
      canViewReports: false,
      canManageInventory: false,
    },
  },
  CHEF: {
    labelAr: 'الشيف / المطبخ',
    labelEn: 'Chef / Kitchen',
    modules: [
      OPERATIONAL_MODULES.KDS,
    ],
    actions: {
      canVoidInvoice: false,
      canApplyDiscount: false,
      canCloseShift: false,
      canManageUsers: false,
      canViewReports: false,
      canManageInventory: false,
    },
  },
  WAITER: {
    labelAr: 'ويتر / صالة',
    labelEn: 'Waiter',
    modules: [
      OPERATIONAL_MODULES.TABLES,
      OPERATIONAL_MODULES.POS,
    ],
    actions: {
      canVoidInvoice: false,
      canApplyDiscount: false,
      canCloseShift: false,
      canManageUsers: false,
      canViewReports: false,
      canManageInventory: false,
    },
  },
  INVENTORY_MANAGER: {
    labelAr: 'مدير المخزون',
    labelEn: 'Inventory Manager',
    modules: [
      OPERATIONAL_MODULES.INVENTORY,
      OPERATIONAL_MODULES.REPORTS,
    ],
    actions: {
      canVoidInvoice: false,
      canApplyDiscount: false,
      canCloseShift: false,
      canManageUsers: false,
      canViewReports: true,
      canManageInventory: true,
    },
  },
};

// دالة مساعدة: هل الدور ده يقدر يوصل للشاشة دي؟
export function canAccessModule(role: UserRole, moduleId: string): boolean {
  const def = ROLE_PERMISSIONS[role];
  if (!def) return false;
  if (def.modules === 'ALL') return true;
  return def.modules.includes(moduleId);
}

// دالة مساعدة: هل الدور ده مسموح له بالفعل ده؟
export function hasAction(role: UserRole, action: keyof RoleActions): boolean {
  const def = ROLE_PERMISSIONS[role];
  if (!def) return false;
  return def.actions[action] === true;
}
