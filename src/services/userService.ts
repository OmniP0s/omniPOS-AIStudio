// خدمة إدارة المستخدمين — إضافة/تعديل/حذف/reset + دوال التحقق
// البيانات في الذاكرة حالياً (تبدأ من SEED_USERS)؛ تُربط بتخزين دائم لاحقاً

import type { User } from '../types';
import { SEED_USERS, type SeedUser, type AuthResult } from '../config/users.seed';

// نسخة قابلة للتعديل تبدأ من القائمة المبدئية
let users: SeedUser[] = SEED_USERS.map(u => ({ ...u }));

// بيانات إنشاء/تعديل مستخدم (من شاشة الإدارة)
export interface UserInput {
  name: string;
  email: string;
  role: User['role'];
  password?: string; // للمالك/المدير
  pin?: string;      // للكاشير/الشيف/الويتر
  branchId?: string;
}

// يشيل الحقول الحساسة قبل الإرجاع للواجهة
function toSafe(u: SeedUser): User {
  const { password, ...safe } = u;
  return safe;
}

// كل المستخدمين (بدون باسوردات) — لعرضهم في الجدول
export function listUsers(): User[] {
  return users.map(toSafe);
}

// إنشاء مستخدم جديد
export function createUser(input: UserInput): { ok: true; user: User } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!name || !email) return { ok: false, error: 'الاسم والبريد الإلكتروني مطلوبان' };
  if (users.some(u => u.email.toLowerCase() === email)) {
    return { ok: false, error: 'هذا البريد مستخدم بالفعل' };
  }
  // لازم إما باسورد أو PIN
  if (!input.password?.trim() && !input.pin?.trim()) {
    return { ok: false, error: 'يجب تحديد كلمة مرور أو رقم سري (PIN)' };
  }
  // PIN لازم يكون فريد لو موجود
  if (input.pin?.trim() && users.some(u => u.pin && u.pin === input.pin!.trim())) {
    return { ok: false, error: 'هذا الرقم السري مستخدم بالفعل' };
  }

  const newUser: SeedUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role: input.role,
    pin: input.pin?.trim() || '',
    password: input.password?.trim() || undefined,
    branchId: input.branchId?.trim() || 'branch-01',
    permissions: [],
  };
  users.push(newUser);
  return { ok: true, user: toSafe(newUser) };
}

// تعديل مستخدم موجود (الاسم/الدور/الفرع فقط — البيانات الحساسة عبر reset)
export function updateUser(id: string, changes: Partial<UserInput>): { ok: true; user: User } | { ok: false; error: string } {
  const u = users.find(x => x.id === id);
  if (!u) return { ok: false, error: 'المستخدم غير موجود' };

  if (changes.name !== undefined) u.name = changes.name.trim();
  if (changes.role !== undefined) u.role = changes.role;
  if (changes.branchId !== undefined) u.branchId = changes.branchId.trim();
  return { ok: true, user: toSafe(u) };
}

// حذف مستخدم — مع حماية: مايتشالش آخر مالك (SUPER_ADMIN)
export function deleteUser(id: string): { ok: true } | { ok: false; error: string } {
  const u = users.find(x => x.id === id);
  if (!u) return { ok: false, error: 'المستخدم غير موجود' };

  if (u.role === 'SUPER_ADMIN') {
    const owners = users.filter(x => x.role === 'SUPER_ADMIN');
    if (owners.length <= 1) return { ok: false, error: 'لا يمكن حذف آخر مالك للنظام' };
  }

  users = users.filter(x => x.id !== id);
  return { ok: true };
}

// إعادة تعيين كلمة المرور أو الرقم السري
export function resetCredential(id: string, kind: 'password' | 'pin', value: string): { ok: true } | { ok: false; error: string } {
  const u = users.find(x => x.id === id);
  if (!u) return { ok: false, error: 'المستخدم غير موجود' };
  const v = value.trim();
  if (!v) return { ok: false, error: 'القيمة الجديدة مطلوبة' };

  if (kind === 'pin') {
    if (users.some(x => x.id !== id && x.pin && x.pin === v)) {
      return { ok: false, error: 'هذا الرقم السري مستخدم بالفعل' };
    }
    u.pin = v;
  } else {
    u.password = v;
  }
  return { ok: true };
}

// ===== دوال التحقق (تعمل على القائمة الحية بدل الثابتة) =====

export function authenticateByEmail(email: string, password: string): AuthResult {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  if (!cleanEmail || !cleanPass) return { ok: false, reason: 'EMPTY_INPUT' };

  const found = users.find(
    u => u.email.toLowerCase() === cleanEmail && u.password && u.password === cleanPass
  );
  if (!found) return { ok: false, reason: 'INVALID_CREDENTIALS' };
  return { ok: true, user: toSafe(found) };
}

export function authenticateByPin(pin: string): AuthResult {
  const cleanPin = pin.trim();
  if (!cleanPin) return { ok: false, reason: 'EMPTY_INPUT' };

  const found = users.find(u => u.pin && u.pin === cleanPin);
  if (!found) return { ok: false, reason: 'INVALID_CREDENTIALS' };
  return { ok: true, user: toSafe(found) };
}
