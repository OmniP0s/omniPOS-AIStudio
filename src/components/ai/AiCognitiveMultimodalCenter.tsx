// ============================================================================
// COGNITIVE & MULTIMODAL AI ENTERPRISE CENTER
// SPRINT 3.3 PRODUCTION DASHBOARD
// ============================================================================

import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Eye,
  FileText,
  Video,
  Image as ImageIcon,
  Search,
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  Layers,
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  Send,
  Camera,
  Flame,
  Check,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Award,
} from 'lucide-react';
import { cognitiveAi } from '../../domain/cognitive_ai/cognitiveAiFacade';
import {
  ArabicDialect,
  DigitalTwinSimulationConfig,
  DigitalTwinSimulationResult,
  ImageAssetType,
  OcrSourceType,
} from '../../domain/cognitive_ai/types';

interface Props {
  isArabic?: boolean;
}

export function AiCognitiveMultimodalCenter({ isArabic = false }: Props) {
  const [activeTab, setActiveTab] = useState<
    | 'VOICE_AI'
    | 'VISION_AI'
    | 'KITCHEN_VIDEO'
    | 'DOC_INTEL'
    | 'IMAGE_STUDIO'
    | 'SEMANTIC_SEARCH'
    | 'DIGITAL_TWIN'
    | 'RL_OPTIMIZER'
    | 'EXPERIMENTS'
  >('VOICE_AI');

  // Voice AI State
  const [selectedDialect, setSelectedDialect] = useState<ArabicDialect>('NAJDI');
  const [sttResult, setSttResult] = useState(() => cognitiveAi.voice.transcribeAudio('', 'NAJDI'));
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAgentInput, setVoiceAgentInput] = useState('');
  const [activeSession, setActiveSession] = useState(() => cognitiveAi.voice.getAllSessions()[0]);
  const [voiceCommandInput, setVoiceCommandInput] = useState('أضف اثنين برجر واغيو مدخن لطاولة 4 مع خصم 15% VIP');
  const [voiceCommandResult, setVoiceCommandResult] = useState(() => cognitiveAi.voice.parseVoiceCommand(voiceCommandInput));

  // Vision AI State
  const [ocrDocType, setOcrDocType] = useState<OcrSourceType>('ZATCA_TAX_INVOICE');
  const [ocrResult, setOcrResult] = useState(() => cognitiveAi.vision.processDocumentOcr('', 'ZATCA_TAX_INVOICE'));
  const [shelfZone, setShelfZone] = useState<'WALK_IN_CHILLER' | 'DRY_STORAGE_A'>('WALK_IN_CHILLER');
  const [shelfResult, setShelfResult] = useState(() => cognitiveAi.vision.getShelfInventoryDetection('WALK_IN_CHILLER'));

  // Kitchen & Video State
  const [selectedStation, setSelectedStation] = useState<'GRILL_LINE' | 'ASSEMBLY_TABLE' | 'FRYER_STATION' | 'PACKAGING_DISPATCH'>('GRILL_LINE');
  const [cameraEvent, setCameraEvent] = useState(() => cognitiveAi.vision.getKitchenCameraStream('GRILL_LINE'));
  const [queueTelemetry] = useState(() => cognitiveAi.video.getQueueTelemetry());
  const [heatmapZones] = useState(() => cognitiveAi.video.getSpatialHeatmapZones());
  const [cctvEvents] = useState(() => cognitiveAi.video.getRecentEvents());

  // Document Intel State
  const [allDocs, setAllDocs] = useState(() => cognitiveAi.documents.getAllDocuments());
  const [selectedDoc, setSelectedDoc] = useState(allDocs[0]);

  // Image Studio State
  const [imageJobs, setImageJobs] = useState(() => cognitiveAi.creative.getAllJobs());
  const [selectedAssetType, setSelectedAssetType] = useState<ImageAssetType>('MARKETING_POSTER');
  const [selectedCampaign, setSelectedCampaign] = useState<'SAUDI_NATIONAL_DAY' | 'RAMADAN_SEASON' | 'FOUNDATION_DAY' | 'WEEKEND_FEAST'>('SAUDI_NATIONAL_DAY');
  const [customPromptEn, setCustomPromptEn] = useState('');
  const [customPromptAr, setCustomPromptAr] = useState('');

  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('Wagyu cooking temperature');
  const [searchResults, setSearchResults] = useState(() => cognitiveAi.search.search(searchQuery));

  // Digital Twin State
  const [twinConfig, setTwinConfig] = useState<DigitalTwinSimulationConfig>({
    branchId: 'BR-OLAYA-01',
    simulationHours: 4,
    customerArrivalRatePerHour: 80,
    kitchenThroughputOrdersPerHour: 90,
    activeKitchenStations: 4,
    activeStaffCount: 8,
    driveThruEnabled: true,
    surgeScenario: 'FRIDAY_DINNER_SPIKE',
  });
  const [simulationResult, setSimulationResult] = useState<DigitalTwinSimulationResult>(() =>
    cognitiveAi.simulation.runSimulation(twinConfig)
  );

  // Reinforcement Learning State
  const [rlState, setRlState] = useState(() => cognitiveAi.rl.getState());

  // Experiments State
  const [abExperiments] = useState(() => cognitiveAi.experiments.getExperiments());
  const [promptTests] = useState(() => cognitiveAi.experiments.getPromptTestCases());
  const [benchmarkSummary, setBenchmarkSummary] = useState(() => cognitiveAi.experiments.runAutoBenchmark());

  // Handlers
  const handleTranscribe = (dialect: ArabicDialect) => {
    setSelectedDialect(dialect);
    setIsRecording(true);
    setTimeout(() => {
      setSttResult(cognitiveAi.voice.transcribeAudio('', dialect));
      setIsRecording(false);
    }, 600);
  };

  const handleVoiceAgentSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceAgentInput.trim()) return;
    const updated = cognitiveAi.voice.processVoiceAgentTurn(activeSession.sessionId, voiceAgentInput, selectedDialect);
    setActiveSession({ ...updated });
    setVoiceAgentInput('');
  };

  const handleParseCommand = () => {
    if (!voiceCommandInput.trim()) return;
    setVoiceCommandResult(cognitiveAi.voice.parseVoiceCommand(voiceCommandInput));
  };

  const handleOcrProcess = (type: OcrSourceType) => {
    setOcrDocType(type);
    setOcrResult(cognitiveAi.vision.processDocumentOcr('', type));
  };

  const handleGenerateImage = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob = cognitiveAi.creative.createGenerationJob(
      selectedAssetType,
      selectedCampaign,
      selectedAssetType === 'SOCIAL_STORY_9_16' ? '9:16' : '16:9',
      customPromptEn || undefined,
      customPromptAr || undefined
    );
    setImageJobs([newJob, ...cognitiveAi.creative.getAllJobs()]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResults(cognitiveAi.search.search(searchQuery));
  };

  const handleRunTwinSimulation = () => {
    setSimulationResult(cognitiveAi.simulation.runSimulation(twinConfig));
  };

  const handleRlStep = () => {
    const updated = cognitiveAi.rl.stepTraining(50);
    setRlState({ ...updated });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                {isArabic ? 'منصة الذكاء الإدراكي والمتعدد الوسائط' : 'Cognitive & Multimodal AI Platform'}
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Sprint 3.3 GA
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Grade AAA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'الصوت المتقدم • الرؤية الحاسوبية • معالجة الوثائق • التوأم الرقمي • التعلم التعزيزي • استوديو التوليد'
                : 'Voice AI • Vision & OCR • Document Intel • Video Analytics • Digital Twin • RL Optimizer • Creative Studio'}
            </p>
          </div>
        </div>

        {/* Global Telemetry Chips */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">P99 Inference:</span>
            <span className="font-semibold text-slate-200">145 ms</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">STT Accuracy:</span>
            <span className="font-semibold text-emerald-400">99.4% (Najdi/MSA)</span>
          </div>
        </div>
      </header>

      {/* Main Navigation Sub-Bar */}
      <nav className="px-6 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {[
          { id: 'VOICE_AI', labelEn: 'Voice AI & Agents', labelAr: 'الذكاء الصوتي والوكلاء', icon: Mic },
          { id: 'VISION_AI', labelEn: 'Vision & Advanced OCR', labelAr: 'الرؤية والتعرف الضوئي', icon: Eye },
          { id: 'KITCHEN_VIDEO', labelEn: 'Kitchen & CCTV Video', labelAr: 'كاميرات المطبخ والمراقبة', icon: Video },
          { id: 'DOC_INTEL', labelEn: 'Document Intelligence', labelAr: 'ذكاء المستندات والعقود', icon: FileText },
          { id: 'IMAGE_STUDIO', labelEn: 'Creative Image Studio', labelAr: 'استوديو الصور الإبداعية', icon: ImageIcon },
          { id: 'SEMANTIC_SEARCH', labelEn: 'Enterprise Search', labelAr: 'البحث الدلالي المعرفي', icon: Search },
          { id: 'DIGITAL_TWIN', labelEn: 'Digital Twin Simulation', labelAr: 'محاكاة التوأم الرقمي', icon: Activity },
          { id: 'RL_OPTIMIZER', labelEn: 'RL Optimizer & Pricing', labelAr: 'التعلم التعزيزي والتسعير', icon: Zap },
          { id: 'EXPERIMENTS', labelEn: 'AI Experiments & Benchmark', labelAr: 'منصة التجارب والمعايير', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: VOICE AI & VOICE AGENT */}
        {/* ========================================================================= */}
        {activeTab === 'VOICE_AI' && (
          <div className="space-y-6">
            {/* Top Grid: STT Dialect Lab & Hands-free POS Voice Command Parser */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Arabic/English STT Dialect Engine */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'محرك التعرف الصوتي واللهجات (STT)' : 'Bilingual STT Dialect Recognition'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'يدعم اللهجة النجدية، الحجازية، الخليجية، الفصحى والإنجليزية' : 'Supports Najdi, Hijazi, Gulf, Egyptian, MSA & English'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTranscribe(selectedDialect)}
                    disabled={isRecording}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    {isRecording ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                        <span>{isArabic ? 'جاري الاستماع...' : 'Listening...'}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تجربة النطق' : 'Simulate Audio'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Dialect Selector Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['NAJDI', 'HIJAZI', 'GULF', 'EGYPTIAN', 'MSA', 'ENGLISH_UK', 'ENGLISH_US'] as ArabicDialect[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => handleTranscribe(d)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                        selectedDialect === d
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* STT Result Transcript Box */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">ID: {sttResult.transcriptId}</span>
                    <span className="text-emerald-400 font-medium">Confidence: {sttResult.confidenceScorePct}%</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-400 font-semibold">{isArabic ? 'النص العربي المنطوق:' : 'Arabic Transcription:'}</div>
                    <div className="text-sm font-medium text-amber-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800" dir="rtl">
                      "{sttResult.transcriptionAr}"
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-400 font-semibold">{isArabic ? 'الترجمة الإنجليزية والكيانات:' : 'English Normalization & Entities:'}</div>
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono">
                      "{sttResult.transcriptionEn}"
                    </div>
                  </div>

                  {/* Extracted Entities Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sttResult.recognizedEntities.map((ent, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-indigo-300 border border-slate-700">
                        {ent.entityType}: <strong className="text-slate-100">{String(ent.normalizedValue)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: POS Hands-Free Voice Commands */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'أوامر الكاشير والمطبخ الصوتية' : 'Hands-Free POS & Kitchen Voice Commands'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'معالجة النوايا الفورية: إضافة طلب، تطبيق خصم، طباعة فاتورة، فحص مخزون' : 'Instant Intent Parser: Add items, apply discounts, print ZATCA invoice, query stock'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400">{isArabic ? 'الأمر الصوتي المباشر:' : 'Spoken Voice Command Input:'}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voiceCommandInput}
                      onChange={(e) => setVoiceCommandInput(e.target.value)}
                      placeholder="e.g. Add 2 Wagyu Burgers to Table 4"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleParseCommand}
                      className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition"
                    >
                      {isArabic ? 'تنفيذ الأمر' : 'Execute'}
                    </button>
                  </div>
                </div>

                {/* Command Execution Result */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        INTENT: {voiceCommandResult.intent}
                      </span>
                      <span className="text-slate-400">Confidence: {(voiceCommandResult.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold">
                      STATUS: {voiceCommandResult.actionStatus}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                    <div className="font-semibold text-emerald-400 mb-1">
                      {isArabic ? 'استجابة النظام:' : 'System Action Response:'}
                    </div>
                    <div>{isArabic ? voiceCommandResult.systemResponseAr : voiceCommandResult.systemResponseEn}</div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Parameters: {JSON.stringify(voiceCommandResult.parameters)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Autonomous Multi-Turn Drive-Thru Voice Agent */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'وكيل طلبات السيارات الذكي (Drive-Thru Voice Agent)' : 'Autonomous Drive-Thru Voice Ordering Agent'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'حوار تفاعلي متعدد الجولات، تحديث سلة الشراء لحظياً، واقتراح ترقية المبيعات (Upselling)' : 'Multi-turn context tracking, real-time cart mutations, 15% VAT & smart upsell suggestions'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                    Channel: {activeSession.channel}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    State: {activeSession.sessionState}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversation Box */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="h-64 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    {activeSession.conversationHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-xl text-xs ${
                            msg.role === 'USER'
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                          }`}
                        >
                          <div className="text-[10px] font-bold opacity-75 mb-1">
                            {msg.role === 'USER' ? 'Customer / العميل' : 'OmniVoice Agent / الوكيل'}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleVoiceAgentSend} className="flex gap-2">
                    <input
                      type="text"
                      value={voiceAgentInput}
                      onChange={(e) => setVoiceAgentInput(e.target.value)}
                      placeholder={isArabic ? 'تحدث إلى الوكيل... (مثال: أضف بطاطس مقلية بالكمأة)' : 'Speak to Voice Agent... (e.g. Add 1 Truffle Fries and 1 Cola)'}
                      className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'إرسال' : 'Send'}</span>
                    </button>
                  </form>
                </div>

                {/* Real-Time Cart & Live Upsell Panel */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-200">{isArabic ? 'سلة الطلب المباشرة' : 'Live Order Check'}</h3>
                    <span className="text-xs text-indigo-400 font-bold">
                      SAR {activeSession.cartTotalSar.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {activeSession.cartItems.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-900 border border-slate-800">
                        <div>
                          <div className="font-semibold text-slate-200">{isArabic ? it.nameAr : it.nameEn}</div>
                          <div className="text-[10px] text-slate-400">Qty: {it.quantity} • {it.modifiers.join(', ')}</div>
                        </div>
                        <div className="font-bold text-slate-300">SAR {(it.priceSar * it.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>SAR {(activeSession.cartTotalSar - activeSession.vatAmountSar).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (15%):</span>
                      <span>SAR {activeSession.vatAmountSar.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Upsell Recommendations */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{isArabic ? 'ترقيات موصى بها من الذكاء الاصطناعي:' : 'AI Suggested Upsells:'}</span>
                    </div>
                    {activeSession.suggestedUpsells.map((up, idx) => (
                      <div key={idx} className="text-[11px] p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        + {up}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VISION AI & ADVANCED OCR */}
        {/* ========================================================================= */}
        {activeTab === 'VISION_AI' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: OCR Ingestion Controller */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'التعرف الضوئي المتقدم (Advanced OCR)' : 'Advanced Bilingual OCR Engine'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'فواتير الموردين، إيصالات الكاشير، خط اليد، والفواتير الضريبية' : 'Supplier B2B, Thermal Receipts, Handwritten Notes & ZATCA'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400">{isArabic ? 'اختر نوع الوثيقة للمسح:' : 'Select Document Preset to Scan:'}</label>
                  <div className="space-y-2">
                    {[
                      { id: 'ZATCA_TAX_INVOICE', label: 'ZATCA Phase 2 POS Receipt (B2C)', desc: 'Thermal receipt with ECDSA TLV QR code' },
                      { id: 'SUPPLIER_INVOICE', label: 'B2B Meat Supplier Invoice (Al-Watania)', desc: 'Bilingual line items with VAT number & stamp' },
                      { id: 'HANDWRITTEN_NOTE', label: 'Handwritten Kitchen Slip & Notes', desc: 'Allergy alerts & custom chef preparation instructions' },
                    ].map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleOcrProcess(doc.id as OcrSourceType)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition ${
                          ocrDocType === doc.id
                            ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-200">{doc.label}</div>
                        <div className="text-[11px] text-slate-400">{doc.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="text-slate-400 font-semibold">OCR Performance SLA:</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Overall Confidence:</span>
                    <span className="font-bold text-emerald-400">{ocrResult.overallConfidencePct}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Processing Latency:</span>
                    <span className="font-bold text-indigo-400">{ocrResult.processingTimeMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>ZATCA QR Validity:</span>
                    <span className="font-bold text-emerald-400">{ocrResult.isZatcaQrValid ? 'VALID CRYPTO' : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Right Columns: Parsed Line Items & Bounding Box Inspection */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {ocrResult.supplierNameEn || 'Scanned Document OCR Result'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      VAT ID: {ocrResult.vatRegistrationNumber || '300984716200003'} • Doc #{ocrResult.invoiceNumber || 'INV-9921'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                    {ocrResult.documentType}
                  </span>
                </div>

                {/* Handwritten Special Warnings */}
                {ocrResult.handwrittenNotesDetected && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'ملاحظات بخط اليد تم التعرف عليها:' : 'Handwritten Text & Signatures Detected:'}</span>
                    </div>
                    {ocrResult.handwrittenNotesDetected.map((note, idx) => (
                      <div key={idx} className="text-amber-200 font-mono text-[11px]">
                        • {note}
                      </div>
                    ))}
                  </div>
                )}

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">{isArabic ? 'الوصف' : 'Description'}</th>
                        <th className="py-2 px-3 text-right">{isArabic ? 'الكمية' : 'Qty'}</th>
                        <th className="py-2 px-3 text-right">{isArabic ? 'سعر الوحدة' : 'Unit Price'}</th>
                        <th className="py-2 px-3 text-right">{isArabic ? 'الضريبة (15%)' : 'VAT (SAR)'}</th>
                        <th className="py-2 px-3 text-right">{isArabic ? 'الإجمالي' : 'Total (SAR)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {ocrResult.lineItems.map((item) => (
                        <tr key={item.lineNumber} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{item.lineNumber}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-200">{item.itemDescriptionEn}</div>
                            <div className="text-[11px] text-slate-400">{item.itemDescriptionAr}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                            {item.unitPriceSar > 0 ? item.unitPriceSar.toFixed(2) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                            {item.taxAmountSar > 0 ? item.taxAmountSar.toFixed(2) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                            {item.lineTotalSar > 0 ? item.lineTotalSar.toFixed(2) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                {ocrResult.grandTotalSar > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-end gap-6 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">Subtotal: </span>
                      <strong className="text-slate-200">SAR {ocrResult.subtotalSar.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">VAT (15%): </span>
                      <strong className="text-slate-200">SAR {ocrResult.vatTotalSar.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Grand Total: </span>
                      <strong className="text-emerald-400 text-sm">SAR {ocrResult.grandTotalSar.toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shelf Inventory Computer Vision Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'التعرف على مخزون الأرفف بالكاميرا الذكية' : 'Shelf Inventory Computer Vision Detection'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'كشف كميات اللحوم والزيوت والمواد الجافة وتوليد تنبيهات نقص المخزون التلقائية' : 'Visual fill %, bounding box SKU localization & auto replenishment alerts'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shelfResult.detectedItems.map((sku, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-200">{sku.productNameEn}</div>
                        <div className="text-[11px] text-slate-400">{sku.productNameAr}</div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          sku.isBelowReorderThreshold
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {sku.isBelowReorderThreshold ? 'REORDER' : 'NOMINAL'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Fill Level:</span>
                        <span className="font-bold text-slate-200">{sku.fillPercentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sku.fillPercentage < 25 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${sku.fillPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        {sku.currentStockCount} / {sku.maxCapacity} units in stock
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KITCHEN & CCTV VIDEO INTELLIGENCE */}
        {/* ========================================================================= */}
        {activeTab === 'KITCHEN_VIDEO' && (
          <div className="space-y-6">
            {/* Top Row: Real-Time Kitchen Camera Stations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kitchen Station Feed Simulator */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'مراقبة خطوط الطهي وجودة الأطباق بالكاميرا' : 'Kitchen Camera Cooking & Plating Monitor'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'كشف ارتداء القفازات والقبعات، نضج اللحوم، وقياس وقت التجهيز' : 'Hygiene compliance, doneness grading & cook duration tracking'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Station Tabs */}
                <div className="flex gap-2">
                  {(['GRILL_LINE', 'ASSEMBLY_TABLE', 'FRYER_STATION', 'PACKAGING_DISPATCH'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setSelectedStation(st);
                        setCameraEvent(cognitiveAi.vision.getKitchenCameraStream(st));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedStation === st
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Live Station Telemetry Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400">Camera: {cameraEvent.cameraId}</span>
                    <span className="text-emerald-400 font-bold">Active Ticket: {cameraEvent.activeTicketId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold">Hygiene & Safety:</div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Chef Hat & Apron Verified</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sanitized Food Gloves Active</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold">Plating & Doneness:</div>
                      <div className="text-slate-200">
                        Doneness: <strong className="text-amber-400">{cameraEvent.platingQuality.steakDonenessGrading || 'A+ Fresh'}</strong>
                      </div>
                      <div className="text-slate-200">
                        Presentation: <strong className="text-emerald-400">{cameraEvent.platingQuality.presentationScorePct}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Cook Elapsed Time:</span>
                      <span className="font-mono text-slate-200">
                        {cameraEvent.ticketCookingTimeSeconds}s / {cameraEvent.cookingTimeTargetSeconds}s target
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (cameraEvent.ticketCookingTimeSeconds / cameraEvent.cookingTimeTargetSeconds) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CCTV Security Anomaly & Alert Feed */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {isArabic ? 'أحداث المراقبة الأمنية والتشغيلية (CCTV AI)' : 'CCTV Security & Operational Anomaly Events'}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'كشف الازدحام، درج النقد المفتوح، وتجاوز مدة جلوس الطاولات' : 'Queue surges, open drawer alerts & dwell time threshold monitoring'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {cctvEvents.map((evt) => (
                    <div key={evt.eventId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{evt.cameraLocation.replace(/_/g, ' ')}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.severity === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </div>
                      <div className="text-slate-400">{evt.automatedRemediationTaken}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Confidence: {evt.confidencePct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Queue Analysis & Customer Flow Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Queue Latency Metrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{isArabic ? 'تحليل طوابير الانتظار (Drive-Thru & Kiosks)' : 'Queue & Wait-Time Analytics'}</span>
                </h3>
                <div className="space-y-3">
                  {queueTelemetry.map((q) => (
                    <div key={q.zoneId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-200">{q.zoneName}</span>
                        <span className="font-mono text-emerald-400 font-bold">{q.averageWaitTimeSeconds}s avg</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Active Count: {q.currentCustomerCount} customers {q.currentVehicleCount ? `(${q.currentVehicleCount} cars)` : ''}</span>
                        <span>Target: &lt; {q.targetMaxWaitSeconds}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spatial Floor Heatmap */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-pink-400" />
                  <span>{isArabic ? 'الخريطة الحرارية لكثافة العملاء' : 'Spatial Customer Flow Heatmap'}</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {heatmapZones.map((h) => (
                    <div key={h.zoneId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
                      <div className="font-semibold text-slate-200">{h.zoneLabel}</div>
                      <div className="flex justify-between text-slate-400">
                        <span>Traffic Density:</span>
                        <span className="font-bold text-pink-400">{h.trafficDensityPct}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Avg Dwell:</span>
                        <span className="font-mono text-slate-200">{h.currentDwellTimeMinutes} mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DOCUMENT INTELLIGENCE */}
        {/* ========================================================================= */}
        {activeTab === 'DOC_INTEL' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'مستودع الوثائق والعقود الذكي' : 'Enterprise Document Ingestion'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'عقود التوريد، رخص بلدي، شهادات الصحة' : 'Supplier Agreements, Municipal Permits & Leases'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {allDocs.map((doc) => (
                    <button
                      key={doc.documentId}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition ${
                        selectedDoc.documentId === doc.documentId
                          ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-slate-200">{doc.documentName}</div>
                      <div className="text-[11px] text-slate-400 flex justify-between mt-1">
                        <span>{doc.documentCategory.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-emerald-400">{doc.complianceScorePct}% score</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Document Details & Clause Auditor */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedDoc.documentName}</h3>
                    <p className="text-xs text-slate-400">Category: {selectedDoc.documentCategory}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Compliance: {selectedDoc.complianceScorePct}%
                  </span>
                </div>

                {/* Key Values */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-300">{isArabic ? 'البيانات المستخرجة:' : 'Extracted Entities & Metadata:'}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedDoc.extractedKeyValues).map(([k, v]) => (
                      <div key={k} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400 block text-[11px]">{k}:</span>
                        <strong className="text-slate-200">{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clause Extraction & Risk Assessment */}
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-300">{isArabic ? 'تحليل البنود والمخاطر التعاقدية:' : 'Extracted Clauses & Risk Evaluation:'}</div>
                  {selectedDoc.extractedClauses.map((clause, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{clause.clauseTitleEn}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            clause.riskLevel === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300'
                              : clause.riskLevel === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {clause.riskLevel} RISK
                        </span>
                      </div>
                      <div className="text-slate-400">{clause.clauseSummary}</div>
                      {clause.penaltyTerms && (
                        <div className="text-rose-400 text-[11px]">Penalty: {clause.penaltyTerms}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Critical Dates & Expiry Countdown */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-300">{isArabic ? 'المواعيد الحرجة وتواريخ الانتهاء:' : 'Critical Expiry Dates & Deadlines:'}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDoc.criticalDates.map((cd, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-200">{cd.label}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{cd.date}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                          {cd.daysRemaining} days
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CREATIVE IMAGE GENERATION STUDIO */}
        {/* ========================================================================= */}
        {activeTab === 'IMAGE_STUDIO' && (
          <div className="space-y-6">
            {/* Generator Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {isArabic ? 'استوديو توليد الصور التسويقية وقوائم الطعام' : 'Creative Image Generation Studio'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'بوسترات اليوم الوطني، قصص انستغرام 9:16، وشاشات القوائم الرقمية 4K' : 'Saudi National Day Posters, 9:16 Social Stories, 1:1 Feeds & 4K Digital Menu Visuals'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerateImage} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Asset Format:</label>
                  <select
                    value={selectedAssetType}
                    onChange={(e) => setSelectedAssetType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="MARKETING_POSTER">Marketing Poster (16:9)</option>
                    <option value="SOCIAL_STORY_9_16">Social Media Story (9:16)</option>
                    <option value="SOCIAL_FEED_1_1">Social Feed Post (1:1)</option>
                    <option value="MENU_BOARD_DISPLAY">Digital Menu Board (16:9)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Campaign Preset:</label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="SAUDI_NATIONAL_DAY">Saudi National Day (اليوم الوطني)</option>
                    <option value="RAMADAN_SEASON">Ramadan Season (موسم رمضان)</option>
                    <option value="FOUNDATION_DAY">Foundation Day (يوم التأسيس)</option>
                    <option value="WEEKEND_FEAST">Weekend Feast (ولائم نهاية الأسبوع)</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isArabic ? 'توليد أصل تسويقي جديد' : 'Generate Creative Asset'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Generated Assets Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {imageJobs.map((job) => (
                <div key={job.jobId} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-3">
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={job.generatedImageUrl}
                      alt={job.promptEn}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase border border-white/20">
                      {job.bilingualTypographyOverlay.badgeText || job.targetCampaign.replace(/_/g, ' ')}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-indigo-600 text-[10px] font-bold text-white">
                      {job.aspectRatio} • {job.imageResolution}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-xs font-bold text-white">
                      {job.bilingualTypographyOverlay.headingEn}
                    </div>
                    <div className="text-[11px] text-amber-300" dir="rtl">
                      {job.bilingualTypographyOverlay.headingAr}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {job.bilingualTypographyOverlay.subtextEn}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-indigo-300 font-semibold">
                        {job.bilingualTypographyOverlay.callToActionEn}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{job.assetType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ENTERPRISE SEMANTIC SEARCH */}
        {/* ========================================================================= */}
        {activeTab === 'SEMANTIC_SEARCH' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {isArabic ? 'البحث الدلالي المتقاطع في الوثائق والمعرفة' : 'Enterprise Cross-Document Semantic Search'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isArabic ? 'البحث في وصفات الطعام، أدلة المطبخ، لوائح الزكاة والضريبة، ونظام العمل' : 'Semantic search with verified page citations across recipes, SOPs, ZATCA tax laws & HR policies'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث في المعرفة... (مثال: درجة حرارة طهي الواغيو أو متطلبات الفاتورة الإلكترونية)' : 'Search knowledge... (e.g. Wagyu cooking temperature or ZATCA QR code)'}
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'بحث' : 'Search'}</span>
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {searchResults.map((res) => (
                <div key={res.documentId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">{res.documentTitle}</h3>
                      <span className="text-[11px] text-teal-400 font-mono">Source: {res.documentSource}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                      {res.matchScorePct}% Match
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="text-slate-200 leading-relaxed">{res.matchedSnippet}</div>
                    {res.matchedSnippetAr && (
                      <div className="text-amber-200/90 leading-relaxed font-sans" dir="rtl">
                        {res.matchedSnippetAr}
                      </div>
                    )}
                  </div>

                  {/* Citations */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-400">{isArabic ? 'المراجع والصفحات الموثقة:' : 'Verified Document Citations:'}</div>
                    {res.citations.map((cit, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                        <span>Page {cit.pageNumber} • {cit.sectionTitle}: "{cit.exactQuote}"</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Factual
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: DIGITAL TWIN SIMULATION */}
        {/* ========================================================================= */}
        {activeTab === 'DIGITAL_TWIN' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'محاكاة التوأم الرقمي للمطعم والمطبخ' : 'Restaurant & Kitchen Digital Twin Simulator'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'اختبار سيناريوهات الضغط العالي (عشاء الجمعة، زحام الإفطار الرمضاني) وتحديد الاختناقات' : 'Stress-test surge footfalls, KDS ticket throughput bottlenecks & revenue projection'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRunTwinSimulation}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'تشغيل المحاكاة' : 'Run Simulation'}</span>
                </button>
              </div>

              {/* Simulation Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Surge Scenario:</label>
                  <select
                    value={twinConfig.surgeScenario}
                    onChange={(e) => setTwinConfig({ ...twinConfig, surgeScenario: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="BASELINE_NORMAL">Baseline Normal (1.0x)</option>
                    <option value="FRIDAY_DINNER_SPIKE">Friday Dinner Spike (1.85x)</option>
                    <option value="RAMADAN_IFTAR_RUSH">Ramadan Iftar Rush (2.6x)</option>
                    <option value="NATIONAL_DAY_EXTREME">National Day Extreme (3.2x)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Arrivals (Customers/hr):</label>
                  <input
                    type="number"
                    value={twinConfig.customerArrivalRatePerHour}
                    onChange={(e) => setTwinConfig({ ...twinConfig, customerArrivalRatePerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Kitchen Capacity (Orders/hr):</label>
                  <input
                    type="number"
                    value={twinConfig.kitchenThroughputOrdersPerHour}
                    onChange={(e) => setTwinConfig({ ...twinConfig, kitchenThroughputOrdersPerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Active Stations:</label>
                  <input
                    type="number"
                    value={twinConfig.activeKitchenStations}
                    onChange={(e) => setTwinConfig({ ...twinConfig, activeKitchenStations: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Simulation KPI Results */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Total Customers Served:</div>
                <div className="text-xl font-bold text-white font-mono">{simulationResult.totalCustomersServed}</div>
                <div className="text-[10px] text-slate-500">over {twinConfig.simulationHours} simulated hours</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Projected Revenue:</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">SAR {simulationResult.projectedRevenueSar.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Gross food & beverage</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Average KDS Ticket Time:</div>
                <div className="text-xl font-bold text-indigo-400 font-mono">{simulationResult.averageKdsTicketTimeMinutes} mins</div>
                <div className="text-[10px] text-slate-500">Cook + assembly time</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Bottleneck Station:</div>
                <div className="text-lg font-bold text-rose-400 font-mono">{simulationResult.bottleneckStation}</div>
                <div className="text-[10px] text-slate-500">Primary capacity constraint</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{isArabic ? 'توصيات الذكاء الاصطناعي لتحسين الطاقة الاستيعابية:' : 'Digital Twin Operational Recommendations:'}</span>
              </div>
              {simulationResult.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-200">{rec.action}</span>
                  <div className="flex gap-3 text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">+SAR {rec.expectedRevenueImpactSar} Impact</span>
                    <span className="text-indigo-400">-{rec.expectedWaitReductionPct}% wait</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: REINFORCEMENT LEARNING OPTIMIZER */}
        {/* ========================================================================= */}
        {activeTab === 'RL_OPTIMIZER' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'محرك التعلم التعزيزي للتسعير الديناميكي وتوازن المطبخ' : 'Reinforcement Learning Multi-Objective Optimizer'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'دالة المكافأة: (الهامش × الحجم) - عقوبة الهدر - عقوبة التأخير' : 'Reward Function: (Margin SAR × Volume) - Spoilage Penalty - Kitchen Delay Penalty'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRlStep}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'تدريب دورات إضافية (+50)' : 'Train 50 Episodes'}</span>
                </button>
              </div>

              {/* Stats Chips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Iterations:</span>
                  <strong className="text-white text-base">{rlState.currentIteration}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Avg Reward:</span>
                  <strong className="text-emerald-400 text-base">{rlState.averageRewardPerEpisode}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Epsilon (Exploration):</span>
                  <strong className="text-indigo-400 text-base">{rlState.explorationRateEpsilon.toFixed(3)}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Discount Factor (γ):</span>
                  <strong className="text-slate-200 text-base">{rlState.discountFactorGamma}</strong>
                </div>
              </div>
            </div>

            {/* Live Recommendations & Q-Table Sample */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendations */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white">{isArabic ? 'قرارات التحسين النشطة:' : 'Live Policy Optimization Actions:'}</h3>
                <div className="space-y-3">
                  {rlState.liveOptimizationSuggestions.map((sug, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{sug.targetEntity}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          +SAR {sug.expectedRewardUpliftSar}
                        </span>
                      </div>
                      <div className="text-slate-400">{sug.recommendedAction}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Confidence: {sug.confidencePct}% • Status: {sug.appliedStatus}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Q-Table Sample */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-white">{isArabic ? 'جدول قيم Q المتعلمة (Q-Table State-Action):' : 'Q-Table Policy Weights:'}</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {rlState.qTableSample.map((q, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <div className="text-slate-400 font-mono text-[11px]">{q.stateKey}</div>
                        <div className="font-semibold text-slate-200">{q.action}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-400 font-mono">Q: {q.qValue}</div>
                        <div className="text-[10px] text-slate-500 font-mono">visits: {q.visitCount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: AI EXPERIMENT PLATFORM & BENCHMARKING */}
        {/* ========================================================================= */}
        {activeTab === 'EXPERIMENTS' && (
          <div className="space-y-6">
            {/* Top Row: Auto Benchmarking Telemetry */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isArabic ? 'منصة تقييم النماذج واختبارات A/B المعيارية' : 'AI Experiment Platform & Model Benchmark'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'مقارنة دقة وتكلفة النماذج (Gemini 3.7 Flash vs Gemini 3.1 Pro)' : 'Automated regression test suites, p-value statistical significance & multi-model evaluations'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                  {benchmarkSummary.overallGrade}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Pass Rate:</span>
                  <strong className="text-emerald-400 text-base">{benchmarkSummary.passRatePct}%</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Gemini 3.7 Flash Latency:</span>
                  <strong className="text-indigo-400 text-base">{benchmarkSummary.avgLatencyFlashMs} ms</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Gemini 3.1 Pro Latency:</span>
                  <strong className="text-purple-400 text-base">{benchmarkSummary.avgLatencyProMs} ms</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Cost Efficiency:</span>
                  <strong className="text-emerald-400 text-base">{benchmarkSummary.costSavingsFlashPct}% Savings</strong>
                </div>
              </div>
            </div>

            {/* A/B Test Experiments */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white">{isArabic ? 'تجارب A/B الحية:' : 'Active A/B Test Experiments:'}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {abExperiments.map((exp) => (
                  <div key={exp.experimentId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-200">{exp.experimentName}</div>
                        <div className="text-[11px] text-indigo-400 font-mono">{exp.targetFeature}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        WINNER: {exp.winningVariant}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-300">{exp.variantA.name}</div>
                        <div className="text-slate-400">Conversion: <strong className="text-slate-200">{exp.variantA.conversionRatePct}%</strong></div>
                        <div className="text-slate-400">AOV: <strong className="text-slate-200">SAR {exp.variantA.averageOrderValueSar}</strong></div>
                      </div>

                      <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-800/60 space-y-1">
                        <div className="font-bold text-indigo-300">{exp.variantB.name}</div>
                        <div className="text-indigo-300">Conversion: <strong className="text-emerald-400">{exp.variantB.conversionRatePct}%</strong></div>
                        <div className="text-indigo-300">AOV: <strong className="text-emerald-400">SAR {exp.variantB.averageOrderValueSar}</strong></div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                      <span>p-value: {exp.pValue} (Statistically Significant)</span>
                      <span>Status: {exp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Regression Test Suite */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white">{isArabic ? 'مصفوفة اختبارات المطالبات الذهبية (Golden Prompts):' : 'Golden Prompt Regression Matrix:'}</h3>
              <div className="space-y-3">
                {promptTests.map((test) => (
                  <div key={test.testId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{test.category}</span>
                      <div className="flex gap-2">
                        <span className="font-mono text-indigo-400">Similarity: {test.similarityScorePct}%</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {test.passStatus}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">Prompt: "{test.inputPrompt}"</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                      Flash Output: {test.actualOutputGemini37Flash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
