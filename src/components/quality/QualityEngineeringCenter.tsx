import React, { useState } from 'react';
import {
  FileCheck2,
  Users,
  Clock,
  Flame,
  FileCode2,
  Database,
  ShieldAlert,
  Eye,
  MousePointer,
  Award,
  Globe,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { QualityTab } from '../../domain/quality/types';
import { TestManagementView } from './TestManagementView';
import { SyntheticTransactionsView } from './SyntheticTransactionsView';
import { SoakTestingView } from './SoakTestingView';
import { MassiveScaleTestingView } from './MassiveScaleTestingView';
import { ApiCertificationView } from './ApiCertificationView';
import { DatabaseCertificationView } from './DatabaseCertificationView';
import { SecurityCertificationView } from './SecurityCertificationView';
import { AccessibilityCertificationView } from './AccessibilityCertificationView';
import { UxOperatorCertificationView } from './UxOperatorCertificationView';
import { ProductionReadinessScoreView } from './ProductionReadinessScoreView';
import { Phase11GlobalReleaseView } from './Phase11GlobalReleaseView';

interface Props {
  isArabic: boolean;
}

export const QualityEngineeringCenter: React.FC<Props> = ({ isArabic }) => {
  const [activeTab, setActiveTab] = useState<QualityTab>('TEST_MANAGEMENT');

  const tabs: { id: QualityTab; labelEn: string; labelAr: string; icon: any; badge?: string }[] = [
    { id: 'TEST_MANAGEMENT', labelEn: '1. Test Mgmt', labelAr: '1. إدارة الاختبارات', icon: FileCheck2, badge: 'RPN' },
    { id: 'SYNTHETIC_TRANSACTIONS', labelEn: '2. 24/7 Synthetic Bots', labelAr: '2. المستخدمين الافتراضيين', icon: Users, badge: '24/7' },
    { id: 'SOAK_TESTING', labelEn: '3. Soak Testing', labelAr: '3. اختبار التحمل (30d)', icon: Clock, badge: '30d' },
    { id: 'MASSIVE_SCALE', labelEn: '4. Massive Scale', labelAr: '4. مقياس 100k نقطة بيع', icon: Flame, badge: '100k POS' },
    { id: 'API_CERTIFICATION', labelEn: '5. API Cert', labelAr: '5. اعتماد الواجهات', icon: FileCode2, badge: 'OAS 3.1' },
    { id: 'DATABASE_CERTIFICATION', labelEn: '6. DB Cert', labelAr: '6. اعتماد قواعد البيانات', icon: Database, badge: '0.14ms' },
    { id: 'SECURITY_CERTIFICATION', labelEn: '7. Security Cert', labelAr: '7. شهادة الأمان', icon: ShieldAlert, badge: 'ASVS L4' },
    { id: 'ACCESSIBILITY_CERTIFICATION', labelEn: '8. a11y & RTL', labelAr: '8. إمكانية الوصول', icon: Eye, badge: 'WCAG 2.2' },
    { id: 'UX_CERTIFICATION', labelEn: '9. UX & Ergonomics', labelAr: '9. كفاءة المشغلين', icon: MousePointer, badge: '3.2 Clicks' },
    { id: 'READINESS_SCORE', labelEn: '10. Readiness Score', labelAr: '10. مؤشر الجاهزية', icon: Award, badge: '99.4/100' },
    { id: 'PHASE11_GLOBAL_RELEASE', labelEn: '11. Global Release', labelAr: '11. الإطلاق العالمي', icon: Globe, badge: 'GA v1.0' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6 select-none">
      {/* Center Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              {isArabic
                ? 'منصة هندسة الجودة والاعتماد المؤسسي (Enterprise Quality Engineering & Release Tower)'
                : 'Enterprise Quality Engineering & Global Release Mission Control'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'التحكم الشامل بجميع ركائز الجودة: إدارة الاختبارات، المستخدمون الافتراضيون، اختبار التحمل 30 يوم، محاكاة 100 ألف جهاز، الاعتمادات الشاملة، وبوابات الإطلاق العالمي'
              : 'End-to-end assurance: Test Management, 24/7 Synthetic Bots, 30-Day Soak, 100k POS Scale, API/DB/Sec/a11y/UX Certifications, and Phase 11 GA Release Gates.'}
          </p>
        </div>
      </div>

      {/* 11-Tab Navigation Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div>
        {activeTab === 'TEST_MANAGEMENT' && <TestManagementView isArabic={isArabic} />}
        {activeTab === 'SYNTHETIC_TRANSACTIONS' && <SyntheticTransactionsView isArabic={isArabic} />}
        {activeTab === 'SOAK_TESTING' && <SoakTestingView isArabic={isArabic} />}
        {activeTab === 'MASSIVE_SCALE' && <MassiveScaleTestingView isArabic={isArabic} />}
        {activeTab === 'API_CERTIFICATION' && <ApiCertificationView isArabic={isArabic} />}
        {activeTab === 'DATABASE_CERTIFICATION' && <DatabaseCertificationView isArabic={isArabic} />}
        {activeTab === 'SECURITY_CERTIFICATION' && <SecurityCertificationView isArabic={isArabic} />}
        {activeTab === 'ACCESSIBILITY_CERTIFICATION' && <AccessibilityCertificationView isArabic={isArabic} />}
        {activeTab === 'UX_CERTIFICATION' && <UxOperatorCertificationView isArabic={isArabic} />}
        {activeTab === 'READINESS_SCORE' && <ProductionReadinessScoreView isArabic={isArabic} />}
        {activeTab === 'PHASE11_GLOBAL_RELEASE' && <Phase11GlobalReleaseView isArabic={isArabic} />}
      </div>
    </div>
  );
};
