import React from 'react';
import { X, Sparkles, Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">دليل استخدام النموذج التجريبي</h3>
            <p className="text-xs text-slate-500">كل ما تحتاج معرفته عن النموذج المدمج</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block text-xs mb-0.5">النموذج المستخدم: Gemini 3.7 Flash</strong>
              هو أحدث النماذج السريعة والذكية من Google، مخصص للمحادثات الفورية، توليد الأفكار، البرمجة، والتلخيص بدقة متناهية.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block text-xs mb-0.5">أمان المفاتيح والبيانات</strong>
              جميع طلبات الذكاء الاصطناعي تمر عبر خادم محلي آمن ومحمي، والمفتاح غير متاح نهائياً للمتصفح.
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-slate-800 text-xs">أهم النصائح للحصول على أفضل نتائج:</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>حدد هدفك بوضوح وأرفق سياق الموضوع أو الجمهور المستهدف.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>استخدم درجة إبداع (Temperature) منخفضة (0.2) للمهام الدقيقة والبرمجة.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>استخدم درجة إبداع مرتفعة (0.9 - 1.2) لتوليد الأفكار والقصص الإبداعية.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            فهمت، لنبدأ التجربة
          </button>
        </div>
      </div>
    </div>
  );
};
