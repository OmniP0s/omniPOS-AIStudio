import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, Bot, User, Trash2, Copy, Check, Sparkles, Sliders, RefreshCw, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';

const PRESET_PROMPTS = [
  { label: '💡 اقترح أفكار لمشروع تقني', text: 'اقترح 3 أفكار مبتكرة لتطبيقات ويب تستخدم الذكاء الاصطناعي لحل مشاكل يومية مع شرح نموذج العمل لكل فكرة.' },
  { label: '📝 اكتب رسالة بريد احترافية', text: 'اكتب بريد إلكتروني احترافي باللغة العربية لطلب شراكة عمل واجتماع تعريفي مع شركة تقنية.' },
  { label: '🔍 اشرح مفهوم معقد ببساطة', text: 'اشرح كيف تعمل شبكات الذكاء الاصطناعي والتوليد اللغوي (LLMs) بطريقة سهلة ومبسطة لشخص غير تقني.' },
  { label: '🚀 خطة تعلم مهارة جديدة', text: 'ضع لي خطة أسبوعية عملية وشاملة لمدة شهر لتعلم أساسيات تحليل البيانات بالذكاء الاصطناعي.' },
];

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'أهلاً بك! أنا نموذج **Gemini 3.7 Flash** المدمج في التطبيق. يمكنك سؤالي عن أي موضوع، أو تجربة كتابة النصوص، البرمجة، والتحليل. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [tone, setTone] = useState<string>('متوازن ومساعد');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (window.confirm('هل تريد مسح المحادثة وبدء جلسة جديدة؟')) {
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: 'تم بدء محادثة جديدة. اسألني أي سؤال أو اختر من المقترحات بالأسفل!',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setErrorMessage(null);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const assistantMsgId = 'assistant-' + Date.now();
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages([...newMessages, assistantPlaceholder]);

    try {
      const systemInstruction = `أنت مساعد ذكاء اصطناعي ودود، دقيق ومحترف مدعوم بنموذج Gemini 3.7 Flash من Google. أسلوب الإجابة المطلوب: (${tone}). استخدم دائماً لغة واضحة ونسّق نصوصك في نقاط وعناوين واضحة باستخدام Markdown كلما كان مناسباً.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          systemInstruction,
          temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشل الاتصال بالخادم.');
      }

      if (!response.body) {
        throw new Error('لا يوجد تدفق للبيانات.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore single malformed SSE chunk parse errors
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setErrorMessage(message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: `⚠️ عذراً، حدث خطأ أثناء استقبال الإجابة:\n\n${message}`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto p-3 sm:p-6" dir="rtl">
      {/* Top Header bar with controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>محادثة Gemini التفاعلية</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-normal border border-blue-100">
              Live Stream
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            تحدث بحرية واسأل عن أي فكرة أو تحليل، واكتشف سرعة استجابة النموذج
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="chat-toggle-settings"
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showSettings
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>إعدادات النموذج</span>
          </button>

          <button
            id="chat-clear-history"
            onClick={handleClear}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Controls Drawer */}
      {showSettings && (
        <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              مستوى الإبداع (Temperature): <span className="text-blue-600 font-bold">{temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>دقيق ومحدد (0.0)</span>
              <span>متوازن (0.7)</span>
              <span>إبداعي وحر (1.5)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">أسلوب الرد (Tone):</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="متوازن ومساعد">متوازن ومساعد (Default)</option>
              <option value="احترافي وأكاديمي">احترافي وأكاديمي (Formal)</option>
              <option value="مبسط وشيق">مبسط وشيق (Friendly & Simple)</option>
              <option value="مختصر ونقاط سريعة">مختصر ونقاط سريعة (Concise Bullet Points)</option>
              <option value="إبداعي وملهم">إبداعي وملهم (Creative)</option>
            </select>
          </div>
        </div>
      )}

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 pl-1">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs shadow-xs ${
                  isAssistant
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  isAssistant
                    ? 'bg-white border border-slate-200 text-slate-800'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                  <span className="font-semibold">
                    {isAssistant ? 'Gemini 3.7 Flash' : 'أنت'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="markdown-body prose prose-sm max-w-none break-words">
                  {isAssistant ? (
                    <Markdown>{msg.content || (msg.isStreaming ? 'جاري التفكير والكتابة...' : '')}</Markdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Quick copy button */}
                {isAssistant && msg.content && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs"
                    title="نسخ الرد"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-1 pr-11">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Gemini يستجيب لحظياً...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Prompts */}
      {messages.length <= 2 && !loading && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>مقترحات سريعة للتجربة:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                id={`preset-prompt-${idx}`}
                onClick={() => handleSend(p.text)}
                className="text-right p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 text-xs text-slate-700 transition-all flex items-center justify-between group"
              >
                <span className="font-medium group-hover:text-blue-700">{p.label}</span>
                <Send className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 p-2">
        <textarea
          ref={textareaRef}
          id="chat-input-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك أو موضوعك هنا... (اضغط Enter للإرسال، أو Shift+Enter لسطر جديد)"
          rows={2}
          disabled={loading}
          className="w-full resize-none bg-transparent border-none p-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 px-1">
          <div className="text-[11px] text-slate-400">
            النموذج النشط: <strong className="text-slate-600">Gemini 3.7 Flash</strong>
          </div>

          <button
            id="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              input.trim() && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>إرسال</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
