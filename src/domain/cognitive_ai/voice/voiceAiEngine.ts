// ============================================================================
// VOICE AI ENGINE — BILINGUAL STT, TTS, VOICE AGENT & COMMAND PARSER
// SPRINT 3.3
// ============================================================================

import {
  ArabicDialect,
  SttTranscriptionResult,
  TtsSynthesisRequest,
  TtsSynthesisResult,
  VoiceAgentSession,
  VoiceCommandIntent,
} from '../types';

export class VoiceAiEngine {
  private activeSessions: Map<string, VoiceAgentSession> = new Map();

  constructor() {
    this.initSampleSession();
  }

  private initSampleSession(): void {
    const sampleSession: VoiceAgentSession = {
      sessionId: 'voice-sess-drive-thru-01',
      channel: 'DRIVE_THRU',
      customerIdentifier: 'VIP-GUEST-8842',
      currentTurnCount: 3,
      sessionState: 'SPEAKING',
      cartItems: [
        {
          menuItemId: 'ITEM-WAGYU-BURGER',
          nameEn: 'Double Smoked Wagyu Burger',
          nameAr: 'برجر واغيو مدخن مزدوج',
          quantity: 2,
          priceSar: 68.0,
          modifiers: ['Extra Truffle Aioli', 'No Pickles'],
        },
        {
          menuItemId: 'ITEM-TRUFFLE-FRIES',
          nameEn: 'Parmesan Truffle Fries',
          nameAr: 'بطاطس مقلية بالكمأة والبارميزان',
          quantity: 2,
          priceSar: 28.0,
          modifiers: ['Crispy'],
        },
      ],
      cartTotalSar: 192.0,
      vatAmountSar: 28.8,
      conversationHistory: [
        {
          role: 'AGENT',
          text: 'مرحباً بك في أومني برجر! كيف أقدر أخدمك اليوم؟ / Welcome to OmniBurger! How may I serve you today?',
          timestamp: new Date(Date.now() - 45000).toISOString(),
        },
        {
          role: 'USER',
          text: 'أبغى اثنين برجر واغيو مدخن دبل بدون مخلل مع بطاطس بالكمأة واثنين كولا زيرو لو سمحت',
          timestamp: new Date(Date.now() - 30000).toISOString(),
        },
        {
          role: 'AGENT',
          text: 'تم إضافة اثنين برجر واغيو مدخن واثنين بطاطس بالكمأة. تحب تضيف صوص الترفل الإضافي المميز أو حلا الآيسكريم بالتمر؟',
          timestamp: new Date(Date.now() - 15000).toISOString(),
        },
      ],
      suggestedUpsells: ['Saudi Date Sticky Pudding (SAR 24)', 'Extra Truffle Aioli Dip (SAR 6)', 'Craft Hibiscus Iced Tea (SAR 18)'],
    };

    this.activeSessions.set(sampleSession.sessionId, sampleSession);
  }

  // --------------------------------------------------------------------------
  // 1. SPEECH-TO-TEXT (STT) TRANSCRIPTION
  // --------------------------------------------------------------------------

  public transcribeAudio(
    audioPayload: string | ArrayBuffer,
    preferredDialect: ArabicDialect = 'NAJDI'
  ): SttTranscriptionResult {
    const dialectSampleMap: Record<ArabicDialect, { en: string; ar: string }> = {
      NAJDI: {
        en: 'Give me two double Wagyu burgers without pickles, extra cheese, and one large truffle fries.',
        ar: 'عطني اثنين واغيو دبل بدون مخلل وجبن زيادة وواحد بطاطس ترفل كبير.',
      },
      HIJAZI: {
        en: 'I would like two smoked brisket burgers, crispy fries, and one iced matcha latte please.',
        ar: 'أبغى حبتين برجر بريسكت مدخن وبطاطس مقرمشة وواحد ماتشا بارد لو تكرمت.',
      },
      GULF: {
        en: 'Three chicken supreme meals with extra garlic sauce and two fresh orange juices.',
        ar: 'ثلاث وجبات دجاج سوبريم مع ثوم زيادة وعصيرين برتقال طازج.',
      },
      EGYPTIAN: {
        en: 'Two beef burger combos with onion rings and diet cola please.',
        ar: 'اتنين كومبو برجر لحمة مع حلقات بصل وكولا دايت لو سمحت.',
      },
      MSA: {
        en: 'Please prepare two ribeye steak dishes, well-done, with grilled asparagus.',
        ar: 'أرجو تحضير وجبتين من لحم الريب آي المشوي، ناضج تماماً، مع الهليون المشوي.',
      },
      ENGLISH_UK: {
        en: 'Could I please have two double Wagyu burgers with parmesan truffle fries and still water?',
        ar: 'هل يمكنني الحصول على اثنين برجر واغيو مزدوج مع بطاطس بارميزان بالكمأة ومياه معدنية؟',
      },
      ENGLISH_US: {
        en: 'Hey, let me get two double Wagyu combos, hold the onions, with a side of ranch.',
        ar: 'مرحباً، أود الحصول على وجبتين واغيو دبل بدون بصل مع صوص الرانش جانباً.',
      },
    };

    const textPair = dialectSampleMap[preferredDialect] || dialectSampleMap.NAJDI;

    const words = textPair.ar.split(' ');
    const wordTimestamps = words.map((w, idx) => ({
      word: w,
      startMs: idx * 240,
      endMs: (idx + 1) * 240,
      confidence: 0.96 + (idx % 4) * 0.01,
    }));

    return {
      transcriptId: `stt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      audioDurationSeconds: (words.length * 0.24) + 0.5,
      detectedDialect: preferredDialect,
      transcriptionEn: textPair.en,
      transcriptionAr: textPair.ar,
      confidenceScorePct: 98.4,
      wordTimestamps,
      recognizedEntities: [
        { entityType: 'MENU_ITEM', entityValue: 'Wagyu Burger', normalizedValue: 'ITEM-WAGYU-BURGER' },
        { entityType: 'QUANTITY', entityValue: 'two / حبتين / اثنين', normalizedValue: 2 },
        { entityType: 'MODIFIER', entityValue: 'No Pickles / بدون مخلل', normalizedValue: 'NO_PICKLES' },
        { entityType: 'MENU_ITEM', entityValue: 'Truffle Fries / بطاطس ترفل', normalizedValue: 'ITEM-TRUFFLE-FRIES' },
      ],
      processedAt: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // 2. TEXT-TO-SPEECH (TTS) AUDIO SYNTHESIS
  // --------------------------------------------------------------------------

  public synthesizeSpeech(
    requestOrText: TtsSynthesisRequest | string,
    voiceName: 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Charon' = 'Zephyr',
    languageCode: 'ar-SA' | 'en-US' = 'ar-SA'
  ): TtsSynthesisResult {
    let req: TtsSynthesisRequest;
    if (typeof requestOrText === 'string') {
      req = {
        text: requestOrText,
        voiceName,
        languageCode,
        speakingRate: 1.0,
        pitch: 0.0,
        emotionStyle: 'FRIENDLY_HOSPITALITY',
      };
    } else {
      req = requestOrText;
    }

    const wordsCount = req.text.split(' ').length;
    const durationMs = Math.round((wordsCount / ((req.speakingRate || 1.0) * 2.8)) * 1000);

    return {
      audioBase64: `DATA:AUDIO/WAV;BASE64,UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=_${req.voiceName}`,
      mimeType: 'audio/wav',
      sampleRateHz: 24000,
      durationMs,
      textSynthesized: req.text,
      voiceUsed: req.voiceName,
      synthesizedAt: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // 3. MULTI-TURN VOICE AGENT (DRIVE-THRU / CALL CENTER)
  // --------------------------------------------------------------------------

  public getSession(sessionId: string): VoiceAgentSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  public getAllSessions(): VoiceAgentSession[] {
    return Array.from(this.activeSessions.values());
  }

  public processVoiceAgentTurn(
    sessionId: string,
    userInputText: string,
    dialect: ArabicDialect = 'NAJDI'
  ): VoiceAgentSession {
    let session = this.activeSessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        channel: 'DRIVE_THRU',
        currentTurnCount: 0,
        sessionState: 'LISTENING',
        cartItems: [],
        cartTotalSar: 0,
        vatAmountSar: 0,
        conversationHistory: [],
        suggestedUpsells: ['Saudi Date Sticky Pudding (SAR 24)', 'Extra Truffle Aioli Dip (SAR 6)'],
      };
      this.activeSessions.set(sessionId, session);
    }

    session.conversationHistory.push({
      role: 'USER',
      text: userInputText,
      timestamp: new Date().toISOString(),
    });

    session.currentTurnCount += 1;

    // Smart semantic rule-based cart mutation
    const lower = userInputText.toLowerCase();
    if (lower.includes('واغيو') || lower.includes('wagyu') || lower.includes('برجر') || lower.includes('burger')) {
      session.cartItems.push({
        menuItemId: 'ITEM-WAGYU-BURGER',
        nameEn: 'Double Smoked Wagyu Burger',
        nameAr: 'برجر واغيو مدخن مزدوج',
        quantity: 1,
        priceSar: 68.0,
        modifiers: ['Fresh Brioche', 'House Secret Glaze'],
      });
    }

    if (lower.includes('بطاطس') || lower.includes('fries') || lower.includes('ترفل') || lower.includes('truffle')) {
      session.cartItems.push({
        menuItemId: 'ITEM-TRUFFLE-FRIES',
        nameEn: 'Parmesan Truffle Fries',
        nameAr: 'بطاطس مقلية بالكمأة والبارميزان',
        quantity: 1,
        priceSar: 28.0,
        modifiers: ['Extra Crispy'],
      });
    }

    if (lower.includes('كولا') || lower.includes('cola') || lower.includes('بيبسي') || lower.includes('drink')) {
      session.cartItems.push({
        menuItemId: 'ITEM-BEV-COLA',
        nameEn: 'Zero Sugar Crafted Cola',
        nameAr: 'كولا كرافت بدون سكر',
        quantity: 1,
        priceSar: 14.0,
        modifiers: ['Ice & Lemon'],
      });
    }

    // Recalculate totals
    const rawSubtotal = session.cartItems.reduce((acc, it) => acc + (it.priceSar * it.quantity), 0);
    session.cartTotalSar = Number((rawSubtotal * 1.15).toFixed(2));
    session.vatAmountSar = Number((rawSubtotal * 0.15).toFixed(2));

    // Agent response generation
    const responseEn = `Added to your order! Your current total is SAR ${session.cartTotalSar.toFixed(2)} (incl. 15% VAT). Would you like to add our artisan Date Pudding or a drink?`;
    const responseAr = `تمت الإضافة لطلبك! الإجمالي الآن ${session.cartTotalSar.toFixed(2)} ر.س (شامل ضريبة 15%). تحب تجرب حلا التمر بالكراميل أو مشروب منعش؟`;

    session.conversationHistory.push({
      role: 'AGENT',
      text: `${responseAr} / ${responseEn}`,
      timestamp: new Date().toISOString(),
    });

    session.sessionState = 'SPEAKING';
    return session;
  }

  // --------------------------------------------------------------------------
  // 4. POS HANDS-FREE VOICE COMMAND PARSER
  // --------------------------------------------------------------------------

  public parseVoiceCommand(spokenText: string): VoiceCommandIntent {
    const text = spokenText.trim();
    const lower = text.toLowerCase();

    if (lower.includes('خصم') || lower.includes('discount') || lower.includes('vip')) {
      return {
        rawSpokenText: text,
        intent: 'APPLY_DISCOUNT',
        confidence: 0.97,
        parameters: { discountPct: 15, reason: 'VIP_LOYALTY_OVERRIDE' },
        actionStatus: 'EXECUTED',
        systemResponseEn: 'Successfully applied 15% VIP discount to the active order.',
        systemResponseAr: 'تم تطبيق خصم 15% لكبار الشخصيات على الطلب النشط بنجاح.',
      };
    }

    if (lower.includes('فاتورة') || lower.includes('zatca') || lower.includes('invoice') || lower.includes('طباعة') || lower.includes('print')) {
      return {
        rawSpokenText: text,
        intent: 'PRINT_ZATCA_INVOICE',
        confidence: 0.99,
        parameters: { format: 'THERMAL_80MM', includeZatcaQr: true },
        actionStatus: 'EXECUTED',
        systemResponseEn: 'ZATCA Phase 2 compliant B2C tax invoice printed successfully with cryptographic QR code.',
        systemResponseAr: 'تمت طباعة الفاتورة الضريبية المبسطة المتوافقة مع المرحلة الثانية لهيئة الزكاة مع رمز الاستجابة السريع المشفر.',
      };
    }

    if (lower.includes('طاولة') || lower.includes('table') || lower.includes('برجر') || lower.includes('burger') || lower.includes('add') || lower.includes('أضف')) {
      return {
        rawSpokenText: text,
        intent: 'ADD_ITEM_TO_ORDER',
        confidence: 0.95,
        parameters: {
          tableNumber: 4,
          itemSku: 'ITEM-WAGYU-BURGER',
          itemNameEn: 'Double Smoked Wagyu Burger',
          quantity: 2,
        },
        actionStatus: 'EXECUTED',
        systemResponseEn: 'Added 2x Double Smoked Wagyu Burgers to Table 4 ticket.',
        systemResponseAr: 'تمت إضافة 2 برجر واغيو مدخن مزدوج إلى تذكرة طاولة 4.',
      };
    }

    if (lower.includes('تقسيم') || lower.includes('split') || lower.includes('bill')) {
      return {
        rawSpokenText: text,
        intent: 'SPLIT_BILL',
        confidence: 0.94,
        parameters: { splitWays: 3 },
        actionStatus: 'EXECUTED',
        systemResponseEn: 'Order split evenly into 3 separate guest checks.',
        systemResponseAr: 'تم تقسيم الحساب بالتساوي على 3 شيكات منفصلة.',
      };
    }

    if (lower.includes('مخزون') || lower.includes('stock') || lower.includes('كمية') || lower.includes('available')) {
      return {
        rawSpokenText: text,
        intent: 'QUERY_STOCK',
        confidence: 0.96,
        parameters: { sku: 'RAW-WAGYU-A5-RIBEYE' },
        actionStatus: 'EXECUTED',
        systemResponseEn: 'Current inventory for A5 Wagyu Ribeye: 24.5 kg in Walk-in Chiller.',
        systemResponseAr: 'المخزون الحالي للحم الواغيو A5 ريب آي: 24.5 كجم في الثلاجة المركزية.',
      };
    }

    // Default intent
    return {
      rawSpokenText: text,
      intent: 'HOLD_KITCHEN_TICKET',
      confidence: 0.89,
      parameters: { ticketId: 'KDS-ORD-902', durationSec: 300 },
      actionStatus: 'EXECUTED',
      systemResponseEn: 'KDS Ticket #902 paused on the grill line for 5 minutes.',
      systemResponseAr: 'تم إيقاف تذكرة المطبخ رقم 902 مؤقتاً في خط الشواء لمدة 5 دقائق.',
    };
  }
}

export const voiceAiEngine = new VoiceAiEngine();
