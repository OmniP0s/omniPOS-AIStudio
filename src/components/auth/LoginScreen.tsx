import React, { useState } from 'react';
import { BRAND_CONFIG } from '../../config/brand';
import type { User } from '../../types';
import { authenticateByEmail, authenticateByPin } from '../../services/userService';

interface LoginScreenProps {
  isArabic: boolean;
  onLogin: (user: User) => void;
}

type LoginMode = 'EMAIL' | 'PIN';

export const LoginScreen: React.FC<LoginScreenProps> = ({ isArabic, onLogin }) => {
  const [mode, setMode] = useState<LoginMode>('EMAIL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result =
      mode === 'EMAIL'
        ? authenticateByEmail(email, password)
        : authenticateByPin(pin);

    if (result.ok) {
      onLogin(result.user);
    } else {
      setError(
        isArabic
          ? 'بيانات الدخول غير صحيحة. حاول مرة أخرى.'
          : 'Invalid credentials. Please try again.'
      );
    }
  };

  const selectMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="h-screen w-screen flex items-center justify-center bg-slate-950 font-sans px-4 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6"
      >
        {/* Alpha Shadow eagle logo */}
        <img
          src="/logo.png"
          alt="Alpha Shadow eagle logo"
          className="w-32 h-32 object-contain drop-shadow-2xl"
        />

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-amber-400 tracking-wide">
            {isArabic ? BRAND_CONFIG.nameAr : BRAND_CONFIG.nameEn}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isArabic ? BRAND_CONFIG.taglineAr : BRAND_CONFIG.taglineEn}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2 w-full rounded-xl bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => selectMode('EMAIL')}
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'EMAIL'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isArabic ? 'إيميل وكلمة مرور' : 'Email & Password'}
          </button>
          <button
            type="button"
            onClick={() => selectMode('PIN')}
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'PIN'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isArabic ? 'رقم سري (PIN)' : 'PIN'}
          </button>
        </div>

        {mode === 'EMAIL' ? (
          <div className="w-full flex flex-col gap-4">
            {/* Email */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-slate-300 text-sm font-semibold">
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Password */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-slate-300 text-sm font-semibold">
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>
        ) : (
          /* PIN */
          <div className="w-full flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-semibold">
              {isArabic ? 'الرقم السري' : 'PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
              placeholder={isArabic ? 'أدخل الرقم السري' : 'Enter your PIN'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-center tracking-[0.5em] text-lg"
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <p role="alert" className="w-full text-center text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg"
        >
          {isArabic ? 'تسجيل الدخول' : 'Sign In'}
        </button>

        {/* Support contact */}
        <div className="w-full border-t border-slate-800 pt-4 text-center">
          <p className="text-slate-500 text-xs mb-1">
            {isArabic ? 'تحتاج مساعدة؟ تواصل مع الدعم الفني' : 'Need help? Contact technical support'}
          </p>
          <p className="text-slate-400 text-xs" dir="ltr">
            {BRAND_CONFIG.supportPhone} · {BRAND_CONFIG.supportEmail}
          </p>
        </div>
      </form>
    </div>
  );
};
