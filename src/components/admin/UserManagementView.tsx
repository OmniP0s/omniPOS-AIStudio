import React, { useState } from 'react';
import { Users, UserPlus, Trash2, KeyRound, ShieldAlert } from 'lucide-react';
import type { User } from '../../types';
import { hasAction } from '../../config/permissions';
import { ROLE_PERMISSIONS } from '../../config/permissions';
import { listUsers, createUser, deleteUser, resetCredential, type UserInput } from '../../services/userService';

interface UserManagementViewProps {
  isArabic: boolean;
  activeUser: User;
}

const ROLE_OPTIONS: User['role'][] = [
  'SUPER_ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'CHEF', 'WAITER', 'INVENTORY_MANAGER',
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({ isArabic, activeUser }) => {
  const canManage = hasAction(activeUser.role, 'canManageUsers');
  const [users, setUsers] = useState<User[]>(() => listUsers());
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // نموذج الإضافة
  const [form, setForm] = useState<UserInput>({ name: '', email: '', role: 'CASHIER', password: '', pin: '' });

  const refresh = () => setUsers(listUsers());
  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const roleLabel = (role: User['role']) =>
    isArabic ? ROLE_PERMISSIONS[role]?.labelAr || role : ROLE_PERMISSIONS[role]?.labelEn || role;

  // حماية: لو مش مصرّح، اعرض رسالة منع
  if (!canManage) {
    return (
      <div dir={isArabic ? 'rtl' : 'ltr'} className="p-8 flex flex-col items-center justify-center text-center gap-3 text-slate-400">
        <ShieldAlert className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-200">{isArabic ? 'صلاحية غير كافية' : 'Access Denied'}</h2>
        <p>{isArabic ? 'إدارة المستخدمين متاحة لمالك النظام فقط.' : 'User management is restricted to the system owner.'}</p>
      </div>
    );
  }

  const handleAdd = () => {
    const res = createUser(form);
    if (!res.ok) {
      flash('err', 'error' in res ? res.error : (isArabic ? 'فشل العملية' : 'Operation failed'));
      return;
    }
    refresh();
    setForm({ name: '', email: '', role: 'CASHIER', password: '', pin: '' });
    setShowAdd(false);
    flash('ok', isArabic ? 'تم إضافة المستخدم' : 'User added');
  };

  const handleDelete = (u: User) => {
    if (!window.confirm(isArabic ? `حذف المستخدم ${u.name}؟` : `Delete user ${u.name}?`)) return;
    const res = deleteUser(u.id);
    if (!res.ok) {
      flash('err', 'error' in res ? res.error : (isArabic ? 'فشل العملية' : 'Operation failed'));
      return;
    }
    refresh();
    flash('ok', isArabic ? 'تم الحذف' : 'Deleted');
  };

  const handleReset = (u: User) => {
    const kind: 'password' | 'pin' = u.pin ? 'pin' : 'password';
    const value = window.prompt(
      isArabic
        ? `القيمة الجديدة (${kind === 'pin' ? 'رقم سري' : 'كلمة مرور'}) للمستخدم ${u.name}:`
        : `New ${kind} for ${u.name}:`
    );
    if (value === null) return;
    const res = resetCredential(u.id, kind, value);
    if (!res.ok) {
      flash('err', 'error' in res ? res.error : (isArabic ? 'فشل العملية' : 'Operation failed'));
      return;
    }
    flash('ok', isArabic ? 'تم إعادة التعيين' : 'Reset done');
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">{isArabic ? 'إدارة المستخدمين' : 'User Management'}</h1>
            <p className="text-xs text-slate-400">{isArabic ? 'إضافة وتعديل صلاحيات موظفي النظام' : 'Manage system users and their roles'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <UserPlus className="w-4 h-4" />
          {isArabic ? 'مستخدم جديد' : 'Add User'}
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`text-sm rounded-lg px-4 py-2 ${msg.type === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
          {msg.text}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            placeholder={isArabic ? 'الاسم' : 'Name'}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <input
            placeholder={isArabic ? 'البريد الإلكتروني' : 'Email'}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value as User['role'] })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
          <input
            placeholder={isArabic ? 'كلمة المرور (للمالك/المدير)' : 'Password (owner/manager)'}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <input
            placeholder={isArabic ? 'رقم سري PIN (للكاشير/الشيف/الويتر)' : 'PIN (cashier/chef/waiter)'}
            value={form.pin}
            onChange={e => setForm({ ...form, pin: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg px-4 py-2 transition">
            {isArabic ? 'حفظ' : 'Save'}
          </button>
        </div>
      )}

      {/* Users table */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80 text-slate-400 text-xs">
            <tr>
              <th className="text-start px-4 py-3">{isArabic ? 'الاسم' : 'Name'}</th>
              <th className="text-start px-4 py-3">{isArabic ? 'البريد' : 'Email'}</th>
              <th className="text-start px-4 py-3">{isArabic ? 'الدور' : 'Role'}</th>
              <th className="text-start px-4 py-3">{isArabic ? 'طريقة الدخول' : 'Login'}</th>
              <th className="text-center px-4 py-3">{isArabic ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-slate-700/50 text-slate-200">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3 text-slate-400" dir="ltr">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-1 rounded">{roleLabel(u.role)}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{u.pin ? 'PIN' : (isArabic ? 'إيميل' : 'Email')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleReset(u)} title={isArabic ? 'إعادة تعيين' : 'Reset'} className="text-amber-400 hover:text-amber-300">
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(u)} title={isArabic ? 'حذف' : 'Delete'} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
