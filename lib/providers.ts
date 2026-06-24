// ============================================================
// FillForge — LLM Provider Adapters
// ============================================================

import type { ProviderType, ProviderConfig } from './types';
import { decryptKey } from './crypto';

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  pdfBase64?: string;     // For Gemini native PDF
  imageBase64?: string;   // For Gemini vision
  imageMimeType?: string;
}

export interface LLMResponse {
  text: string;
  provider: ProviderType;
  model: string;
  error?: string;
  rateLimited?: boolean;
}

// ---- Provider Implementations ----

async function callGemini(config: ProviderConfig, request: LLMRequest): Promise<LLMResponse> {
  const apiKey = await decryptKey(config.apiKey);
  const model = config.model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts: Array<Record<string, unknown>> = [];

  // System instruction is separate in Gemini API
  const body: Record<string, unknown> = {
    system_instruction: {
      parts: [{ text: request.systemPrompt }],
    },
    contents: [{
      parts,
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  };

  // Add PDF as inline data if available (native PDF support)
  if (request.pdfBase64) {
    parts.push({
      inline_data: {
        mime_type: 'application/pdf',
        data: request.pdfBase64,
      },
    });
  }

  // Add image if available (vision)
  if (request.imageBase64 && request.imageMimeType) {
    parts.push({
      inline_data: {
        mime_type: request.imageMimeType,
        data: request.imageBase64,
      },
    });
  }

  // Always add the text prompt
  parts.push({ text: request.userPrompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.status === 429) {
    return { text: '', provider: 'gemini', model, rateLimited: true, error: 'Rate limited' };
  }

  if (!response.ok) {
    const errBody = await response.text();
    return { text: '', provider: 'gemini', model, error: `Gemini API error ${response.status}: ${errBody}` };
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return { text, provider: 'gemini', model };
}

async function callOpenAICompatible(
  config: ProviderConfig,
  request: LLMRequest,
  endpoint: string,
  defaultModel: string,
  providerType: ProviderType,
  extraHeaders?: Record<string, string>
): Promise<LLMResponse> {
  const apiKey = config.apiKey ? await decryptKey(config.apiKey) : '';
  const model = config.model || defaultModel;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const body = {
    model,
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 500,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (response.status === 429) {
    return { text: '', provider: providerType, model, rateLimited: true, error: 'Rate limited' };
  }

  if (!response.ok) {
    const errBody = await response.text();
    return { text: '', provider: providerType, model, error: `${providerType} error ${response.status}: ${errBody}` };
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';

  return { text, provider: providerType, model };
}

async function callGroq(config: ProviderConfig, request: LLMRequest): Promise<LLMResponse> {
  return callOpenAICompatible(
    config, request,
    'https://api.groq.com/openai/v1/chat/completions',
    'llama-3.3-70b-versatile',
    'groq'
  );
}

async function callOllamaLocal(config: ProviderConfig, request: LLMRequest): Promise<LLMResponse> {
  const model = config.model || 'llama3.2';

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${request.systemPrompt}\n\n${request.userPrompt}`,
        stream: false,
        options: { temperature: 0.1 },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return { text: '', provider: 'ollama-local', model, error: `Ollama error ${response.status}: ${errBody}` };
    }

    const data = await response.json();
    return { text: data.response || '', provider: 'ollama-local', model };
  } catch (error) {
    return {
      text: '',
      provider: 'ollama-local',
      model,
      error: `Cannot connect to Ollama at localhost:11434. Make sure Ollama is running.`,
    };
  }
}

async function callOllamaCloud(config: ProviderConfig, request: LLMRequest): Promise<LLMResponse> {
  return callOpenAICompatible(
    config, request,
    'https://ollama.com/v1/chat/completions',
    'llama3.2',
    'ollama-cloud'
  );
}

async function callOpenRouter(config: ProviderConfig, request: LLMRequest): Promise<LLMResponse> {
  return callOpenAICompatible(
    config, request,
    'https://openrouter.ai/api/v1/chat/completions',
    'google/gemini-2.5-flash',
    'openrouter',
    {
      'HTTP-Referer': 'fillforge-extension',
      'X-Title': 'FillForge',
    }
  );
}

// ---- Provider Dispatch ----

const PROVIDER_DISPATCH: Record<ProviderType, (config: ProviderConfig, request: LLMRequest) => Promise<LLMResponse>> = {
  'gemini': callGemini,
  'groq': callGroq,
  'ollama-local': callOllamaLocal,
  'ollama-cloud': callOllamaCloud,
  'openrouter': callOpenRouter,
};

/**
 * Call an LLM provider. Returns the response or an error.
 */
export async function callProvider(
  config: ProviderConfig,
  request: LLMRequest
): Promise<LLMResponse> {
  const handler = PROVIDER_DISPATCH[config.type];
  if (!handler) {
    return { text: '', provider: config.type, model: '', error: `Unknown provider: ${config.type}` };
  }

  try {
    return await handler(config, request);
  } catch (error) {
    return {
      text: '',
      provider: config.type,
      model: config.model || '',
      error: `Provider ${config.type} threw: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Call providers with fallback chain.
 * Tries primary, then falls back through the ordered list on error/rate-limit.
 */
export async function callWithFallback(
  providers: Record<ProviderType, ProviderConfig>,
  providerOrder: ProviderType[],
  selectedProvider: ProviderType,
  request: LLMRequest
): Promise<LLMResponse & { triedProviders: Array<{ type: ProviderType; error?: string }> }> {
  const triedProviders: Array<{ type: ProviderType; error?: string }> = [];

  // Try selected provider first
  const orderedProviders = [selectedProvider, ...providerOrder.filter(p => p !== selectedProvider)];

  for (const providerType of orderedProviders) {
    const config = providers[providerType];
    if (!config) continue;

    // Skip providers that need keys but don't have them (except ollama-local)
    if (providerType !== 'ollama-local' && !config.apiKey) {
      triedProviders.push({ type: providerType, error: 'API key not configured' });
      continue;
    }

    const response = await callProvider(config, request);
    triedProviders.push({ type: providerType, error: response.error });

    if (!response.error && !response.rateLimited && response.text) {
      return { ...response, triedProviders };
    }

    console.warn(`[FillForge] Provider ${providerType} failed:`, response.error || 'rate limited');
  }

  const errorDetails = triedProviders.map(tp => `${tp.type} (${tp.error})`).join(' | ');

  return {
    text: '',
    provider: selectedProvider,
    model: '',
    error: `All providers failed. Details: ${errorDetails}`,
    triedProviders,
  };
}
