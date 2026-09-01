import { afterEach, describe, expect, it, vi } from 'vitest';

const originalAiEnabled = process.env.AI_ENABLED;
const originalGeminiApiKey = process.env.GEMINI_API_KEY;

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  if (originalAiEnabled === undefined) delete process.env.AI_ENABLED;
  else process.env.AI_ENABLED = originalAiEnabled;
  if (originalGeminiApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalGeminiApiKey;
});

describe('central AI opt-in gate', () => {
  it('defaults to disabled and never constructs a Gemini client', async () => {
    delete process.env.AI_ENABLED;
    delete process.env.GEMINI_API_KEY;
    const constructor = vi.fn();
    vi.doMock('@google/genai', () => ({ GoogleGenAI: constructor }));
    const { AiServiceError, getAi } = await import('../../services/aiService');

    expect(() => getAi()).toThrowError(new AiServiceError('AI_DISABLED', 'AI features are not enabled.'));
    expect(constructor).not.toHaveBeenCalled();
  });

  it('fails clearly without constructing a client when enabled without an API key', async () => {
    process.env.AI_ENABLED = 'true';
    delete process.env.GEMINI_API_KEY;
    const constructor = vi.fn();
    vi.doMock('@google/genai', () => ({ GoogleGenAI: constructor }));
    const { AiServiceError, getAi } = await import('../../services/aiService');

    expect(() => getAi()).toThrowError(new AiServiceError(
      'AI_NOT_CONFIGURED',
      'GEMINI_API_KEY is required when AI features are enabled.',
    ));
    expect(constructor).not.toHaveBeenCalled();
  });

  it('returns the required 503 response from an AI endpoint while disabled', async () => {
    process.env.AI_ENABLED = 'false';
    const { postApiChat } = await import('../../controllers/aiController');
    const req = { body: {} } as any;
    const res = {
      statusCode: 200,
      body: undefined as unknown,
      status(code: number) { this.statusCode = code; return this; },
      json(body: unknown) { this.body = body; return this; },
    } as any;

    await postApiChat(req, res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      error: { code: 'AI_DISABLED', message: 'AI features are not enabled.' },
    });
  });
});
