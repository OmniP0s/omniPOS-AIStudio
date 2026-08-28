import React, { useState } from 'react';
import { globalIntegrations } from '../../domain/integrations/integrationPlatformEngine';
import { IntegrationConnector, WebhookSubscription } from '../../types';
import {
  Cable,
  Globe2,
  KeyRound,
  Webhook,
  Code2,
  Terminal,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface IntegrationPlatformViewProps {
  isArabic: boolean;
}

export const IntegrationPlatformView: React.FC<IntegrationPlatformViewProps> = ({ isArabic }) => {
  const [connectors, setConnectors] = useState<IntegrationConnector[]>(() => globalIntegrations.getConnectors());
  const [webhooks] = useState<WebhookSubscription[]>(() => globalIntegrations.getWebhooks());
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'DEVELOPER' | 'WEBHOOKS'>('MARKETPLACE');
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleSnippet = `// OmniPOS Cloud SDK - Place Order Example (TypeScript)
import { OmniPosClient } from '@omnipos/enterprise-sdk';

const client = new OmniPosClient({
  apiKey: process.env.OMNIPOS_API_KEY,
  branchId: 'b-olaya-01',
  zatcaMode: 'PHASE_2_PRODUCTION'
});

const order = await client.orders.create({
  orderType: 'DINE_IN',
  tableNumber: 'T-12',
  items: [
    { sku: 'TRUFFLE-BURGER', quantity: 2, price: 58.00 },
    { sku: 'CRISPY-FRIES', quantity: 1, price: 16.00 }
  ],
  customer: { phone: '+966501234567' }
});

console.log('Order created:', order.orderNumber, 'ZATCA Hash:', order.zatcaHash);`;

  const handleToggle = (id: string) => {
    globalIntegrations.toggleConnector(id);
    setConnectors([...globalIntegrations.getConnectors()]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cable className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'منصة التكامل وسوق التطبيقات وواجهات المطورين (iPaaS & API)' : 'Integration Marketplace & Developer Hub'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              OpenAPI 3.0 & Webhooks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'الربط المباشر مع تطبيقات التوصيل (جاهز، هنقرستيشن)، أنظمة ERP المحاسبية (SAP، Oracle)، وإشعارات Webhooks'
              : 'Seamless connectors for food aggregators, enterprise ERPs, payment gateways, and Developer REST/SDK APIs'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 px-4 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'MARKETPLACE'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {isArabic ? 'سوق التطبيقات والربط' : 'Integration Marketplace'} ({connectors.length})
        </button>
        <button
          onClick={() => setActiveTab('DEVELOPER')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'DEVELOPER'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {isArabic ? 'بوابة المطورين وSDK' : 'Developer Portal & SDKs'}
        </button>
        <button
          onClick={() => setActiveTab('WEBHOOKS')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'WEBHOOKS'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {isArabic ? 'إشعارات الويب (Webhooks)' : 'Webhook Subscriptions'} ({webhooks.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'MARKETPLACE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectors.map(conn => (
              <div key={conn.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">{conn.icon}</span>
                    <div>
                      <h3 className="font-bold text-white text-sm">{conn.name}</h3>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">{conn.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(conn.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      conn.status === 'CONNECTED'
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-600 hover:text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {conn.status === 'CONNECTED' ? (isArabic ? 'متصل (انقر للفصل)' : 'Connected') : (isArabic ? 'اتصال وتفعيل' : 'Connect')}
                  </button>
                </div>

                <p className="text-xs text-slate-300">{isArabic ? conn.descriptionAr : conn.descriptionEn}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span>Processed Today: <strong className="text-white">{conn.eventsProcessedToday}</strong></span>
                  <span>Last Sync: <strong className="text-indigo-400">{conn.lastSyncTimestamp}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'DEVELOPER' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">
                    {isArabic ? 'حزمة تطوير البرمجيات الرسمية (OmniPOS TypeScript & Node SDK)' : 'Official OmniPOS SDK & Code Snippets'}
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {sampleSnippet}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'WEBHOOKS' && (
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold text-white">{wh.url}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {wh.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Last delivered: {wh.lastDeliveredAt}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-400">{isArabic ? 'الأحداث المشترك بها:' : 'Events:'}</span>
                  {wh.eventTypes.map((ev, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-indigo-300">
                      {ev}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <span>Success: <strong className="text-emerald-400">{wh.successCount}</strong> | Errors: <strong className="text-rose-400">{wh.failureCount}</strong></span>
                  <span>Secret: <strong className="text-slate-200">whsec_••••••••45</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
