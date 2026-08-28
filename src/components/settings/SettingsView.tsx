import React, { useState } from 'react';
import { TenantConfig, Branch } from '../../types';
import { outboxManager } from '../../domain/crdt/outboxSync';
import {
  Settings,
  Building,
  Globe,
  Shield,
  Database,
  RefreshCw,
  CheckCircle2,
  Users,
  CreditCard,
  Percent,
} from 'lucide-react';

interface SettingsViewProps {
  tenant: TenantConfig;
  isArabic: boolean;
  onUpdateTenant: (updated: TenantConfig) => void;
  onToggleLanguage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  tenant,
  isArabic,
  onUpdateTenant,
  onToggleLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'BRANCHES' | 'ZATCA_CONFIG' | 'OFFLINE_SYNC' | 'ROLES'>('BRANCHES');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const res = await outboxManager.syncOutbox();
      setSyncStatus(`Sync Successful: ${res.syncedCount} events committed to Cloud Server`);
    } catch (err: any) {
      setSyncStatus(`Sync Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const queueLength = outboxManager.getQueue().length;
  const vectorClock = outboxManager.getVectorClock();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-slate-100 dark:bg-slate-950 gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isArabic ? 'إعدادات المنظومة والفروع وإدارة المزامنة السحابية' : 'System Configuration & Enterprise Sync Settings'}
            </h2>
            <p className="text-xs text-slate-500">
              {tenant.legalNameAr} ({tenant.legalNameEn}) • VAT: {tenant.vatNumber}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'BRANCHES', labelEn: 'Branches & Locations', labelAr: 'إدارة الفروع' },
              { id: 'ZATCA_CONFIG', labelEn: 'Tax & Fiscal Settings', labelAr: 'الضرائب والفواتير' },
              { id: 'OFFLINE_SYNC', labelEn: 'CRDT Offline Outbox', labelAr: 'المزامنة والمحركات غير المتصلة' },
              { id: 'ROLES', labelEn: 'RBAC Security Roles', labelAr: 'الصلاحيات والأدوار' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isArabic ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {activeTab === 'BRANCHES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenant.branches.map(branch => (
              <div
                key={branch.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {isArabic ? branch.nameAr : branch.nameEn}
                      </h4>
                      <p className="text-xs text-slate-500">{branch.code} • {isArabic ? branch.cityAr : branch.cityEn}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {branch.isMainBranch ? (isArabic ? 'الفرع الرئيسي' : 'Main Branch') : (isArabic ? 'نشط' : 'Active')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p>{isArabic ? branch.addressAr : branch.addressEn}</p>
                  <p className="font-mono">Phone: {branch.phone}</p>
                  <p className="text-[11px] text-slate-400">CR: {tenant.crNumber}</p>
                </div>

              </div>
            ))}
          </div>
        )}

        {activeTab === 'OFFLINE_SYNC' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isArabic ? 'محرك المزامنة غير المتصل (CRDT Vector Clocks)' : 'Offline-First CRDT Outbox Sync Engine'}
                </h3>
                <p className="text-xs text-slate-500">
                  Guarantees zero downtime and 100% causal consistency during network disruptions.
                </p>
              </div>

              <button
                onClick={handleForceSync}
                disabled={isSyncing}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isArabic ? 'مزامنة فورية مع السيرفر' : 'Force Cloud Sync'}</span>
              </button>
            </div>

            {syncStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                {syncStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Pending Outbox Events</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {queueLength} events queued
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Active Vector Clock</span>
                <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                  {JSON.stringify(vectorClock)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ZATCA_CONFIG' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 max-w-2xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isArabic ? 'الضرائب والفواتير والرسوم البلدية' : 'Fiscal & Value Added Tax Configuration'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'نسبة ضريبة القيمة المضافة (VAT Rate)' : 'Standard VAT Rate (%)'}
                </label>
                <input
                  type="text"
                  readOnly
                  value="15% (Kingdom of Saudi Arabia ZATCA Mandate)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isArabic ? 'الرقم الضريبي للمنشأة (15 رقم)' : '15-Digit VAT Tax Registration Number'}
                </label>
                <input
                  type="text"
                  readOnly
                  value={tenant.vatNumber}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ROLES' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { role: 'Franchise Owner / Super Admin', perms: 'All permissions, ZATCA CSID rotation, Multi-Branch reporting, Financial settlement' },
              { role: 'Branch Manager', perms: 'Table floor plan, Shift closing, Stock transfers, Waste approvals, Refund overrides' },
              { role: 'Cashier & Server', perms: 'Take orders, Split bills, Apply standard discounts, Process tenders, Print thermal receipts' },
              { role: 'Kitchen Chef / Line Cook', perms: 'KDS bump tickets, Station routing, Mark items ready, Cook timer alerts' },
              { role: 'Inventory Specialist', perms: 'Stock take counts, Purchase order receipts, Raw material adjustments, BOM viewing' },
            ].map(r => (
              <div
                key={r.role}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{r.role}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.perms}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
