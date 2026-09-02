// قائمة مستخدمين مبدئية + دوال تحقق للدخول
// ملاحظة: الباسوردات هنا نص صريح مؤقتاً لتشغيل المصادقة — تُأمّن لاحقاً بالتشفير + قاعدة بيانات

import type { User } from '../types';

// المستخدم الواحد في القائمة المبدئية (يمتد الـ User ويضيف بيانات الدخول)
export interface SeedUser extends User {
  password?: string; // للمالك والمدير (دخول بإيميل + باسورد)
  // الـ pin موروث من User (للكاشير/الشيف/الويتر)
}

// القائمة المبدئية — 5 مستخدمين كمثال (نعدّلها/نضيف عليها من شاشة الإدارة لاحقاً)
export const SEED_USERS: SeedUser[] = [
  {
    id: 'usr-owner-01',
    name: 'فهد العتيبي',
    email: 'owner@omnipos.sa',
    role: 'SUPER_ADMIN',
    pin: '',
    password: 'Owner@123',
    branchId: 'branch-01',
    permissions: ['ALL'],
  },
  {
    id: 'usr-manager-01',
    name: 'سعد المدير',
    email: 'manager@omnipos.sa',
    role: 'BRANCH_MANAGER',
    pin: '',
    password: 'Manager@123',
    branchId: 'branch-01',
    permissions: [],
  },
  {
    id: 'usr-cashier-01',
    name: 'خالد الكاشير',
    email: 'cashier@omnipos.sa',
    role: 'CASHIER',
    pin: '1111',
    branchId: 'branch-01',
    permissions: [],
  },
  {
    id: 'usr-chef-01',
    name: 'ماهر الشيف',
    email: 'chef@omnipos.sa',
    role: 'CHEF',
    pin: '2222',
    branchId: 'branch-01',
    permissions: [],
  },
  {
    id: 'usr-waiter-01',
    name: 'يوسف الويتر',
    email: 'waiter@omnipos.sa',
    role: 'WAITER',
    pin: '3333',
    branchId: 'branch-01',
    permissions: [],
  },
];

// نوع نتيجة محاولة الدخول
export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'INVALID_CREDENTIALS' | 'EMPTY_INPUT' };

// يشيل الحقول الحساسة (password) قبل ما يرجّع المستخدم للتطبيق
function toSafeUser(seed: SeedUser): User {
  const { password, ...safe } = seed;
  return safe;
}

// تحقق بالإيميل + الباسورد (للمالك والمدير)
export function authenticateByEmail(email: string, password: string): AuthResult {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  if (!cleanEmail || !cleanPass) return { ok: false, reason: 'EMPTY_INPUT' };

  const found = SEED_USERS.find(
    u => u.email.toLowerCase() === cleanEmail && u.password && u.password === cleanPass
  );
  if (!found) return { ok: false, reason: 'INVALID_CREDENTIALS' };
  return { ok: true, user: toSafeUser(found) };
}

// تحقق بالـ PIN (للكاشير/الشيف/الويتر)
export function authenticateByPin(pin: string): AuthResult {
  const cleanPin = pin.trim();
  if (!cleanPin) return { ok: false, reason: 'EMPTY_INPUT' };

  const found = SEED_USERS.find(u => u.pin && u.pin === cleanPin);
  if (!found) return { ok: false, reason: 'INVALID_CREDENTIALS' };
  return { ok: true, user: toSafeUser(found) };
}
