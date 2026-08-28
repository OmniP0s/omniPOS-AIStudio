import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  FileText,
  Sparkles,
  Lightbulb,
  Code2,
  Languages,
  Wand2,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { ToolMode } from '../types';

interface ToolConfig {
  id: ToolMode;
  name: string;
  desc: string;
  icon: React.ElementType;
  placeholder: string;
  sampleInput: string;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'summarize',
    name: 'تلخيص النصوص والمقالات',
    desc: 'استخلاص النقاط الجوهرية والقرارات من نصوص أو مقالات طويلة بدقة عالية',
    icon: FileText,
    placeholder: 'الصق النص الطويل أو المقال الذي ترغب في تلخيصه هنا...',
    sampleInput: `يعتبر الذكاء الاصطناعي التوليدي نقلة نوعية في قطاع التقنية والإنتاجية. يعتمد على شبكات عصبية عميقة تم تدريبها على كميات هائلة من البيانات النصية والبرمجية، مما يمكنه من فهم السياق، توليد أفكار جديدة، كتابة الأكواد، ومساعدة الأفراد والشركات في أتمتة المهام الروتينية. وتتجه كبرى الشركات اليوم لتضمين هذه النماذج في المنتجات اليومية لرفع الكفاءة التشغيلية بنسب تتجاوز 40%.`,
  },
  {
    id: 'rewrite',
    name: 'إعادة صياغة وتحسين الأسلوب',
    desc: 'تحويل أي مسودة أو فكرة إلى أسلوب احترافي، تسويقي، أو أكاديمي جذاب',
    icon: Wand2,
    placeholder: 'اكتب أو الصق النص الذي ترغب في إعادة صياغته...',
    sampleInput: `نريد نعمل تطبيق جديد للتوصيل، الفكرة إن الناس تطلب أي حاجة من السوبرماركت وتوصل في نص ساعة والأسعار رخيصة ومفيش مصاريف خفية.`,
  },
  {
    id: 'ideas',
    name: 'توليد أفكار وعصف ذهني',
    desc: 'ابتكار أفكار مشاريع، حلول للتحديات، خطط تسويق، أو محتوى مبتكر',
    icon: Lightbulb,
    placeholder: 'اكتب الموضوع أو المجال الذي تريد أفكاراً ذكية حوله...',
    sampleInput: `تطبيق ذكاء اصطناعي لمساعدة الطلاب الجامعيين في تنظيم وقت المذاكرة وإعداد ملخصات من المحاضرات الصوتية.`,
  },
  {
    id: 'code',
    name: 'شرح ومراجعة الأكواد البرمجية',
    desc: 'تحليل الأكواد، شرح طريقة عملها، واكتشاف الأخطاء واقتراح كود أنظف وأسرع',
    icon: Code2,
    placeholder: 'الصق الكود البرمجي وسؤالك حوله هنا...',
    sampleInput: `function findDuplicates(arr) {
  let duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}`,
  },
  {
    id: 'translate',
    name: 'ترجمة فورية وبلاغية',
    desc: 'ترجمة سياقية ذكية تحافظ على المعنى الدقيق والمصطلحات التقنية والأسلوب',
    icon: Languages,
    placeholder: 'اكتب النص المراد ترجمته...',
    sampleInput: `Generative AI enables developers to build intuitive, context-aware applications that transform raw user ideas into scalable solutions.`,
  },
];

export const PlaygroundView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolMode>('summarize');
  const [inputPrompt, setInputPrompt] = useState(TOOLS[0].sampleInput);
  const [outputResult, setOutputResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState('احترافي وجذاب');
  const [targetLanguage, setTargetLanguage] = useState('العربية');
  const [temperature, setTemperature] = useState(0.7);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentTool = TOOLS.find((t) => t.id === selectedTool) || TOOLS[0];

  const handleToolChange = (toolId: ToolMode) => {
    setSelectedTool(toolId);
    const found = TOOLS.find((t) => t.id === toolId);
    if (found) {
      setInputPrompt(found.sampleInput);
    }
    setOutputResult('');
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!inputPrompt.trim() || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setOutputResult('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputPrompt.trim(),
          mode: selectedTool,
          tone,
          targetLanguage,
          temperature,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشلت معالجة الطلب');
      }

      setOutputResult(data.text || 'لم يتم توليد نص.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6" dir="rtl">
      {/* Top Banner */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <span>مختبر نماذج الذكاء الاصطناعي المتخصصة</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          اختر الأداة المناسبة للتجربة وشاهد كيف يفهم نموذج Gemini المعطيات وينفذ المهام المختلفة بدقة
        </p>
      </div>

      {/* Tool Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-6">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              id={`tool-btn-${tool.id}`}
              onClick={() => handleToolChange(tool.id)}
              className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                {isSelected && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-medium">نشط</span>
                )}
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm leading-snug">{tool.name}</div>
                <div className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {tool.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Workspace Grid (Input & Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <currentTool.icon className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">{currentTool.name}</h3>
              </div>
              <button
                onClick={() => setInputPrompt(currentTool.sampleInput)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                استرجاع نموذج تجريبي
              </button>
            </div>

            <textarea
              id="tool-input-prompt"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={currentTool.placeholder}
              rows={9}
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y font-sans"
            />

            {/* Context Specific Options */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              {selectedTool === 'rewrite' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الأسلوب المفضل:</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="احترافي وجذاب">احترافي ومقنع (Business & Persuasive)</option>
                    <option value="تسويقي جذاب وإعلاني">تسويقي إعلاني (Marketing Copy)</option>
                    <option value="أكاديمي ورسمي">أكاديمي ورسمي (Formal & Academic)</option>
                    <option value="بسيط ومباشر">بسيط ومباشر (Clear & Direct)</option>
                  </select>
                </div>
              )}

              {selectedTool === 'translate' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">لغة الهدف:</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="العربية">العربية (Arabic)</option>
                    <option value="الإنجليزية (English)">الإنجليزية (English)</option>
                    <option value="الفرنسية (French)">الفرنسية (French)</option>
                    <option value="الألمانية (German)">الألمانية (German)</option>
                    <option value="الإسبانية (Spanish)">الإسبانية (Spanish)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  درجة الإبداع (Temperature): <span className="text-indigo-600 font-bold">{temperature}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              عدد الحروف: <strong className="text-slate-600">{inputPrompt.length}</strong>
            </span>

            <button
              id="tool-submit-btn"
              onClick={handleGenerate}
              disabled={!inputPrompt.trim() || loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                inputPrompt.trim() && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري المعالجة بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>تنفيذ المهمة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Result Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">نتيجة التحليل والتوليد</h3>
              </div>

              {outputResult && (
                <button
                  id="tool-copy-output"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ النتيجة</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {outputResult ? (
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm leading-relaxed max-h-[420px] overflow-y-auto">
                <div className="markdown-body prose prose-sm max-w-none text-slate-800">
                  <Markdown>{outputResult}</Markdown>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400 min-h-[280px]">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-xs text-slate-600 font-medium">
                      Gemini 3.7 Flash يقوم بالتفكير وصياغة النتيجة الآن...
                    </p>
                  </div>
                ) : (
                  <>
                    <currentTool.icon className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">النتيجة ستظهر هنا فور الضغط على تنفيذ</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      يمكنك تجربة إدخال نصوص متنوعة لمعاينة طريقة استجابة وتحليل النموذج للمعلومات
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>النموذج: Gemini 3.7 Flash</span>
            <span>استجابة فورية بدون وسيط</span>
          </div>
        </div>
      </div>
    </div>
  );
};
