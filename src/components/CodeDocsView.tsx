import React, { useState } from 'react';
import { Code2, Server, Terminal, Layers, Check, Copy, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const CodeDocsView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const backendCode = `// 1. استيراد حزمة Google GenAI الرسمية
import { GoogleGenAI } from "@google/genai";

// 2. تهيئة العميل باستخدام المفتاح المحمي في الخادم
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

// 3. استدعاء النموذج لتوليد الإجابة
app.post("/api/chat", async (req, res) => {
  const { messages, systemInstruction, temperature } = req.body;

  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction: systemInstruction || "أنت مساعد ذكي ومفيد.",
      temperature: temperature || 0.7
    }
  });

  res.json({ text: response.text });
});`;

  const frontendCode = `// استدعاء الخادم من تطبيق الواجهة (React)
async function askGemini(promptText) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: promptText,
      mode: "summarize",
      temperature: 0.7
    })
  });

  const data = await response.json();
  console.log("إجابة الذكاء الاصطناعي:", data.text);
  return data.text;
}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6" dir="rtl">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Code2 className="w-6 h-6 text-emerald-600" />
          <span>كيف تم دمج وتطوير هذا النموذج برمجياً؟</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          شرح كامل لهيكل الربط البرمجي بين الخادم (Backend) وحزمة Google GenAI الرسمية والواجهة الأمامية (Frontend)
        </p>
      </div>

      {/* 3 Step Architecture cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 mb-1">1. أمان المفاتيح (Secrets)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            مفتاح <code>GEMINI_API_KEY</code> يتم حفظه واستدعاؤه فقط داخل الخادم، لضمان عدم ظهوره نهائياً في متصفح المستخدم.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 mb-1">2. المعالجة في الخادم (Node/Express)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            استخدام حزمة <code>@google/genai</code> لتمرير التعليمات، ضبط الـ Temperature، وبث النصوص (SSE Streaming) لحظياً.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 mb-1">3. واجهة تفاعلية فورية (React)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            عرض الإجابات فور وصولها بتنسيق Markdown، دعم كامل للغة العربية مع إمكانية نسخ النصوص وتخصيص الأوامر.
          </p>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="space-y-6">
        {/* Backend snippet */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">كود الخادم (Backend - server.ts)</span>
            </div>
            <button
              onClick={() => handleCopy('backend', backendCode)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              {copiedSection === 'backend' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto text-left leading-relaxed text-slate-300 p-2" dir="ltr">
            <code>{backendCode}</code>
          </pre>
        </div>

        {/* Frontend snippet */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-200">كود استدعاء الـ API من الواجهة (React Frontend)</span>
            </div>
            <button
              onClick={() => handleCopy('frontend', frontendCode)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              {copiedSection === 'frontend' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto text-left leading-relaxed text-slate-300 p-2" dir="ltr">
            <code>{frontendCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
