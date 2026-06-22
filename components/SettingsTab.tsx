import React, { useState, useEffect, useCallback } from 'react';
import type { FillForgeSettings, ProviderType } from '../lib/types';
import { createDefaultSettings } from '../lib/types';

const PROVIDER_INFO: Record<ProviderType, { label: string; placeholder: string; url: string }> = {
  'gemini': { label: 'Gemini', placeholder: 'AIza...', url: 'https://aistudio.google.com/apikey' },
  'groq': { label: 'Groq', placeholder: 'gsk_...', url: 'https://console.groq.com/keys' },
  'ollama-local': { label: 'Ollama (Local)', placeholder: 'No key needed', url: 'https://ollama.com' },
  'ollama-cloud': { label: 'Ollama (Cloud)', placeholder: 'Bearer token...', url: 'https://ollama.com' },
  'openrouter': { label: 'OpenRouter', placeholder: 'sk-or-...', url: 'https://openrouter.ai/keys' },
};

const PROVIDER_MODELS: Record<ProviderType, { label: string; value: string }[]> = {
  'gemini': [
    { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
    { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
    { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
    { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' }
  ],
  'groq': [
    { label: 'Llama 3.3 70B', value: 'llama-3.3-70b-versatile' },
    { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
    { label: 'Gemma 2 9B', value: 'gemma2-9b-it' }
  ],
  'ollama-local': [
    { label: 'Llama 3.2', value: 'llama3.2' },
    { label: 'Mistral', value: 'mistral' },
    { label: 'Gemma 2', value: 'gemma2' }
  ],
  'ollama-cloud': [
    { label: 'Llama 3.2', value: 'llama3.2' }
  ],
  'openrouter': [
    { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash' },
    { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
    { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
    { label: 'Llama 3.3 70B (Free)', value: 'meta-llama/llama-3.3-70b-instruct:free' },
    { label: 'DeepSeek R1', value: 'deepseek/deepseek-r1' }
  ]
};

export default function SettingsTab() {
  const [settings, setSettings] = useState<FillForgeSettings>(createDefaultSettings());
  const [keyInputs, setKeyInputs] = useState<Record<ProviderType, string>>({
    'gemini': '', 'groq': '', 'ollama-local': '', 'ollama-cloud': '', 'openrouter': '',
  });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
      if (res?.settings) {
        setSettings(res.settings);
        // Show masked keys if they exist
        const masked: Record<ProviderType, string> = {} as Record<ProviderType, string>;
        for (const key of Object.keys(res.settings.providers) as ProviderType[]) {
          masked[key] = res.settings.providers[key].apiKey ? '••••••••' : '';
        }
        setKeyInputs(masked);
      }
    });
  }, []);

  const handleProviderSelect = useCallback((provider: ProviderType) => {
    const updated = { ...settings, selectedProvider: provider };
    setSettings(updated);
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: { settings: updated } });
  }, [settings]);

  const handleModelChange = useCallback((provider: ProviderType, model: string) => {
    const updated = {
      ...settings,
      providers: {
        ...settings.providers,
        [provider]: { ...settings.providers[provider], model }
      }
    };
    setSettings(updated);
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: { settings: updated } });
  }, [settings]);

  const handleKeyChange = useCallback((provider: ProviderType, value: string) => {
    setKeyInputs(prev => ({ ...prev, [provider]: value }));
  }, []);

  const handleKeySave = useCallback((provider: ProviderType) => {
    const key = keyInputs[provider];
    if (!key || key === '••••••••') return;

    chrome.runtime.sendMessage({
      type: 'SET_PROVIDER_KEY',
      payload: { provider, key },
    }, () => {
      setKeyInputs(prev => ({ ...prev, [provider]: '••••••••' }));
      setSaveStatus(`${PROVIDER_INFO[provider].label} key saved`);
      setTimeout(() => setSaveStatus(''), 2000);
    });
  }, [keyInputs]);

  const handleToggle = useCallback((key: 'fillEEO' | 'skipExistingContent' | 'showConfidenceOverlay') => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: { settings: updated } });
  }, [settings]);

  const handleClearAll = useCallback(() => {
    if (confirm('Clear ALL FillForge data? This cannot be undone.')) {
      chrome.runtime.sendMessage({ type: 'CLEAR_ALL_DATA' }, () => {
        setSettings(createDefaultSettings());
        setKeyInputs({
          'gemini': '', 'groq': '', 'ollama-local': '', 'ollama-cloud': '', 'openrouter': '',
        });
        setSaveStatus('All data cleared');
      });
    }
  }, []);

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Provider Selection */}
      <div className="border border-ff-border rounded-component overflow-hidden">
        <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-b border-ff-border">
          LLM Provider
        </div>
        {(Object.keys(PROVIDER_INFO) as ProviderType[]).map((provider) => (
          <div key={provider} className="px-3 py-2 border-b border-ff-border/50 last:border-0">
            <div className="flex items-center gap-2 mb-1.5">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="radio"
                  name="provider"
                  checked={settings.selectedProvider === provider}
                  onChange={() => handleProviderSelect(provider)}
                  className="accent-ff-accent"
                />
                <span className="text-xs text-ff-text-primary">{PROVIDER_INFO[provider].label}</span>
              </label>
              <a
                href={PROVIDER_INFO[provider].url}
                target="_blank"
                rel="noopener"
                className="text-[10px] text-ff-accent hover:text-ff-accent-hover"
              >
                Get key ↗
              </a>
            </div>
            <div className="flex flex-col gap-2">
              {provider !== 'ollama-local' && (
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={keyInputs[provider]}
                    onChange={(e) => handleKeyChange(provider, e.target.value)}
                    onFocus={(e) => { if (e.target.value === '••••••••') setKeyInputs(prev => ({ ...prev, [provider]: '' })); }}
                    placeholder={PROVIDER_INFO[provider].placeholder}
                    className="flex-1 text-[11px] px-2 py-1.5 bg-ff-bg-elevated border border-ff-border rounded"
                  />
                  <button
                    onClick={() => handleKeySave(provider)}
                    className="px-2 py-1 bg-ff-bg-elevated text-ff-text-secondary text-[10px] border border-ff-border rounded hover:bg-ff-border hover:text-ff-text-primary transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
              {PROVIDER_MODELS[provider] && PROVIDER_MODELS[provider].length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ff-text-muted">Model:</span>
                  <select
                    value={settings.providers[provider]?.model || PROVIDER_MODELS[provider][0].value}
                    onChange={(e) => handleModelChange(provider, e.target.value)}
                    className="flex-1 text-[11px] px-2 py-1 bg-ff-bg-elevated border border-ff-border rounded text-ff-text-primary"
                  >
                    {PROVIDER_MODELS[provider].map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="border border-ff-border rounded-component overflow-hidden">
        <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-b border-ff-border">
          Options
        </div>
        <label className="flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-ff-border/50">
          <input type="checkbox" checked={settings.fillEEO} onChange={() => handleToggle('fillEEO')} className="accent-ff-accent" />
          <span className="text-[11px] text-ff-text-primary">Fill EEO/Demographic fields</span>
        </label>
        <label className="flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-ff-border/50">
          <input type="checkbox" checked={settings.skipExistingContent} onChange={() => handleToggle('skipExistingContent')} className="accent-ff-accent" />
          <span className="text-[11px] text-ff-text-primary">Skip fields with existing content</span>
        </label>
        <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
          <input type="checkbox" checked={settings.showConfidenceOverlay} onChange={() => handleToggle('showConfidenceOverlay')} className="accent-ff-accent" />
          <span className="text-[11px] text-ff-text-primary">Show fill overlay on page</span>
        </label>
      </div>

      {/* Clear Data */}
      <button
        id="btn-clear-all"
        onClick={handleClearAll}
        className="w-full py-2 text-[11px] text-ff-error hover:bg-ff-error/10 rounded-component transition-colors"
      >
        Clear All Data
      </button>

      {saveStatus && (
        <div className="text-[11px] text-ff-success text-center">{saveStatus}</div>
      )}
    </div>
  );
}
