import React, { useState } from 'react';
import { Customer, GiftCard, CouponPromo, User } from '../../types';
import { globalLoyaltyEngine } from '../../domain/customer/loyaltyEngine';
import {
  Users,
  Wallet,
  Gift,
  Tag,
  Award,
  Search,
  Plus,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  History,
  TrendingUp,
} from 'lucide-react';

interface CustomerPlatformViewProps {
  customers: Customer[];
  giftCards: GiftCard[];
  isArabic: boolean;
  onUpdateCustomerWallet?: (customerId: string, newBalance: number) => void;
}

export const CustomerPlatformView: React.FC<CustomerPlatformViewProps> = ({
  customers,
  giftCards,
  isArabic,
  onUpdateCustomerWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'CRM' | 'WALLET' | 'GIFTCARDS' | 'COUPONS' | 'LOYALTY_TIERS'>('CRM');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  const coupons = globalLoyaltyEngine.getCoupons();

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
              {isArabic ? 'منصة العملاء والمحفظة الرقمية' : 'Customer 360, Digital Wallet & Loyalty'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
              RFM Analytics
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'سجل العملاء، بطاقات الهدايا، ونقاط الولاء' : 'Customer Relationship Management & Gift Cards'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isArabic
              ? 'تتبع مشتريات العملاء، شحن المحافظ المدفوعة مسبقاً، ترقية الفئات، وقسائم الخصم الترويجية'
              : 'Omnichannel customer engagement, prepaid wallet top-up, RFM segmentation, and coupon campaigns'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-600/30">
            <Plus className="w-4 h-4" />
            {isArabic ? 'تسجيل عميل جديد' : 'New Customer Profile'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'CRM', labelEn: 'Customer 360 Directory', labelAr: 'دليل وسجل العملاء', icon: Users },
          { id: 'WALLET', labelEn: 'Digital Wallets & Top-up', labelAr: 'المحافظ الرقمية والشحن', icon: Wallet },
          { id: 'GIFTCARDS', labelEn: 'Gift Card Issuance', labelAr: 'بطاقات الهدايا المسبقة', icon: Gift },
          { id: 'COUPONS', labelEn: 'Promo Codes & Campaigns', labelAr: 'قسائم الخصم والحملات', icon: Tag },
          { id: 'LOYALTY_TIERS', labelEn: 'Loyalty Tiers & Rules', labelAr: 'مستويات الولاء والنقاط', icon: Award },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: CRM 360 */}
      {activeTab === 'CRM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'بحث بالاسم أو الهاتف...' : 'Search customer name or phone...'}
                className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredCustomers.map(customer => {
                const segment = globalLoyaltyEngine.classifyRfmSegment(customer);
                const isSelected = selectedCustomer?.id === customer.id;
                return (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{customer.name}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {customer.loyaltyTier}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{customer.phone}</span>
                      <span className="font-mono font-bold text-emerald-600">SAR {customer.totalSpend.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Details 360 */}
          {selectedCustomer ? (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedCustomer.name}
                      {selectedCustomer.isVip && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                          VIP GUEST
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3" /> {selectedCustomer.phone}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3" /> {selectedCustomer.email}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200">
                    {isArabic ? 'تعديل الملف' : 'Edit Profile'}
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">
                    {isArabic ? 'شحن المحفظة' : 'Top-Up Wallet'}
                  </button>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-semibold block">{isArabic ? 'رصيد المحفظة' : 'Prepaid Balance'}</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">
                    SAR {selectedCustomer.walletBalance?.toFixed(2) || '0.00'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-semibold block">{isArabic ? 'نقاط المكافآت' : 'Loyalty Points'}</span>
                  <span className="text-lg font-black text-indigo-600 font-mono">
                    {selectedCustomer.loyaltyPoints} PTS
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-semibold block">{isArabic ? 'إجمالي المشتريات' : 'Lifetime Spend'}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    SAR {selectedCustomer.totalSpend.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-semibold block">{isArabic ? 'عدد الزيارات' : 'Visit Count'}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {selectedCustomer.visitCount} visits
                  </span>
                </div>
              </div>

              {/* Guest Notes & Favorite Dishes */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                  {isArabic ? 'ملاحظات وتفضيلات الضيف (Guest Preferences)' : 'Guest Notes & Dietary Preferences'}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedCustomer.notes || 'Prefers booth seating, highly sensitive to shellfish, regular customer on weekend evenings.'}
                </p>
                {selectedCustomer.favoriteDishes && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedCustomer.favoriteDishes.map((dish, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                        ★ {dish}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 p-12 text-center text-slate-400">Select a customer profile</div>
          )}
        </div>
      )}

      {/* TAB: WALLET */}
      {activeTab === 'WALLET' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'إدارة المحافظ الرقمية والشحن المسبق' : 'Customer Digital Wallet Engine'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'إمكانية شحن الأرصدة مباشرة عبر mada أو التحويل البنكي واستخدامها في نقاط البيع'
                  : 'Fast checkout balance with instant top-up via mada, Apple Pay, and credit card'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">
              {isArabic ? 'شحن رصيد سريع' : 'Instant Top-Up'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3 text-right rtl:text-left">Prepaid Wallet Balance</th>
                  <th className="p-3 text-right rtl:text-left">Loyalty Points</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="p-3 font-mono text-slate-500">{c.phone}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {c.loyaltyTier}
                      </span>
                    </td>
                    <td className="p-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                      SAR {(c.walletBalance || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right rtl:text-left font-mono font-bold text-indigo-600">
                      {c.loyaltyPoints} PTS
                    </td>
                    <td className="p-3 text-center">
                      <button className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                        {isArabic ? 'شحن' : 'Top-Up'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: GIFTCARDS */}
      {activeTab === 'GIFTCARDS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'إصدار وبطاقات الهدايا الرقمية (Gift Cards)' : 'Prepaid Gift Card Management'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'إصدار بطاقات هدايا برمز PIN واستخدامها في نقاط البيع والفروع'
                  : 'Issue electronic gift vouchers with instant redemption at checkout'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إصدار بطاقة جديدة' : 'Issue Gift Card'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {giftCards.map(gc => (
              <div
                key={gc.id}
                className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-900/50 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider text-indigo-400">OMNI GIFT PASS</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {gc.status}
                  </span>
                </div>

                <div className="font-mono text-base font-black tracking-widest text-indigo-100">
                  {gc.code}
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-indigo-800/40">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Initial: SAR {gc.initialBalance}</span>
                    <span className="text-xs text-slate-300 font-medium">Recipient: {gc.recipientName || 'Walk-in'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Current Balance</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      SAR {gc.currentBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: COUPONS */}
      {activeTab === 'COUPONS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                {isArabic ? 'أكواد الخصم والحملات التسويقية (Promos)' : 'Promo Code Engine & Campaign Rules'}
              </h3>
              <p className="text-xs text-slate-500">
                {isArabic
                  ? 'تحديد قيود الخصم (نسبة مئوية، حد أدنى للطلب، أقصى مبلغ للخصم، وعدد مرات الاستخدام)'
                  : 'Automated discount rules with caps, expiration bounds, and real-time POS verification'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isArabic ? 'إنشاء كود ترويجي' : 'New Promo Code'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map(cp => (
              <div
                key={cp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs">
                    {cp.code}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    {cp.type === 'PERCENTAGE' ? `${cp.discountValue}% OFF` : `SAR ${cp.discountValue} OFF`}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {isArabic ? cp.titleAr : cp.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Min Order: SAR {cp.minOrderAmount} • Max Discount: SAR {cp.maxDiscountAmount || 'No Cap'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400">
                  <span>Usage: {cp.usageCount} / {cp.maxUsageLimit}</span>
                  <span>Until {cp.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: LOYALTY TIERS */}
      {activeTab === 'LOYALTY_TIERS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {isArabic ? 'مستويات برنامج الولاء ومعاملات احتساب النقاط' : 'Loyalty Tier Rules & Multipliers'}
          </h3>
          <p className="text-xs text-slate-500">
            {isArabic
              ? 'كل 1 ريال = 1 نقطة. يتم احتساب مضاعفات النقاط تلقائياً حسب فئة العميل'
              : 'Points earning multipliers and threshold requirements for tier auto-promotion'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { name: 'BRONZE', multiplier: '1.0x', threshold: '0 - 599 SAR', color: 'amber-700' },
              { name: 'SILVER', multiplier: '1.25x', threshold: '600 - 1,999 SAR', color: 'slate-400' },
              { name: 'GOLD', multiplier: '1.5x', threshold: '2,000 - 4,999 SAR', color: 'amber-400' },
              { name: 'PLATINUM', multiplier: '2.0x', threshold: '5,000+ SAR', color: 'indigo-500' },
            ].map(tier => (
              <div
                key={tier.name}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-center"
              >
                <span className="font-black text-sm text-slate-900 dark:text-white block">{tier.name}</span>
                <span className="text-lg font-black text-indigo-600 block">{tier.multiplier}</span>
                <span className="text-[11px] text-slate-500 block">{tier.threshold}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
