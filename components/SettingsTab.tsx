import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { FillForgeSettings, ProviderType } from '../lib/types';
import { createDefaultSettings } from '../lib/types';

/* ─── SVG Icon Components (Feather Icons, MIT License) ─── */
const IconStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconZap = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconHome = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCloud = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>;
const IconShuffle = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;

const PROVIDER_INFO: Record<ProviderType, { label: string; placeholder: string; url: string; icon: React.ReactNode; desc: string }> = {
  'gemini': { label: 'Gemini', placeholder: 'AIza...', url: 'https://aistudio.google.com/apikey', icon: <IconStar />, desc: 'Google AI Studio' },
  'groq': { label: 'Groq', placeholder: 'gsk_...', url: 'https://console.groq.com/keys', icon: <IconZap />, desc: 'Ultra-fast inference' },
  'ollama-local': { label: 'Ollama (Local)', placeholder: 'No key needed', url: 'https://ollama.com', icon: <IconHome />, desc: 'Run locally' },
  'ollama-cloud': { label: 'Ollama (Cloud)', placeholder: 'Bearer token...', url: 'https://ollama.com', icon: <IconCloud />, desc: 'Cloud-hosted Ollama' },
  'openrouter': { label: 'OpenRouter', placeholder: 'sk-or-...', url: 'https://openrouter.ai/keys', icon: <IconShuffle />, desc: 'Multi-provider gateway' },
};

const PROVIDER_MODELS: Record<ProviderType, { label: string; value: string }[]> = {
  'gemini': [
    { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
    { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
    { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' }
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

const PROVIDERS_LIST: ProviderType[] = ['gemini', 'groq', 'ollama-local', 'ollama-cloud', 'openrouter'];

/* ─── Custom Dropdown Component ─── */
interface CustomDropdownProps {
  value: string;
  options: { label: string; value: string; icon?: React.ReactNode; desc?: string }[];
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

function CustomDropdown({ value, options, onChange, id, placeholder }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={dropdownRef} className="ff-dropdown" id={id}>
      <button
        type="button"
        className={`ff-dropdown-trigger ${isOpen ? 'ff-dropdown-trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="ff-dropdown-trigger-content">
          {selected?.icon && <span className="ff-dropdown-icon">{selected.icon}</span>}
          <div className="ff-dropdown-label-wrap">
            <span className="ff-dropdown-label">{selected?.label || placeholder || 'Select...'}</span>
            {selected?.desc && <span className="ff-dropdown-desc">{selected.desc}</span>}
          </div>
        </div>
        <svg className={`ff-dropdown-chevron ${isOpen ? 'ff-dropdown-chevron--open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="ff-dropdown-menu">
          <div className="ff-dropdown-menu-scroll">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`ff-dropdown-option ${opt.value === value ? 'ff-dropdown-option--selected' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.icon && <span className="ff-dropdown-icon">{opt.icon}</span>}
                <div className="ff-dropdown-label-wrap">
                  <span className="ff-dropdown-label">{opt.label}</span>
                  {opt.desc && <span className="ff-dropdown-desc">{opt.desc}</span>}
                </div>
                {opt.value === value && (
                  <svg className="ff-dropdown-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Toggle Switch Component ─── */
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="ff-toggle-row">
      <span className="ff-toggle-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`ff-toggle ${checked ? 'ff-toggle--on' : ''}`}
        onClick={onChange}
      >
        <span className="ff-toggle-thumb" />
      </button>
    </label>
  );
}

/* ─── Main Settings Tab ─── */
export default function SettingsTab() {
  const [settings, setSettings] = useState<FillForgeSettings>(createDefaultSettings());
  const [keyInputs, setKeyInputs] = useState<Record<ProviderType, string>>({
    'gemini': '', 'groq': '', 'ollama-local': '', 'ollama-cloud': '', 'openrouter': '',
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
      if (res?.settings) {
        setSettings(res.settings);
        const masked: Record<ProviderType, string> = {} as Record<ProviderType, string>;
        for (const key of Object.keys(res.settings.providers) as ProviderType[]) {
          masked[key] = res.settings.providers[key].apiKey ? '••••••••' : '';
        }
        setKeyInputs(masked);
      }
    });
  }, []);

  const activeProvider = settings.selectedProvider;
  const activeInfo = PROVIDER_INFO[activeProvider];
  const activeModels = PROVIDER_MODELS[activeProvider] || [];
  const currentModel = settings.providers[activeProvider]?.model || activeModels[0]?.value || '';
  const hasKey = keyInputs[activeProvider] === '••••••••';

  const handleProviderSelect = useCallback((provider: string) => {
    const p = provider as ProviderType;
    const updated = { ...settings, selectedProvider: p };
    setSettings(updated);
    setShowKeyInput(false);
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: { settings: updated } });
  }, [settings]);

  const handleModelChange = useCallback((model: string) => {
    const updated = {
      ...settings,
      providers: {
        ...settings.providers,
        [activeProvider]: { ...settings.providers[activeProvider], model }
      }
    };
    setSettings(updated);
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: { settings: updated } });
  }, [settings, activeProvider]);

  const handleKeyChange = useCallback((value: string) => {
    setKeyInputs(prev => ({ ...prev, [activeProvider]: value }));
  }, [activeProvider]);

  const handleKeySave = useCallback(() => {
    const key = keyInputs[activeProvider];
    if (!key || key === '••••••••') return;

    chrome.runtime.sendMessage({
      type: 'SET_PROVIDER_KEY',
      payload: { provider: activeProvider, key },
    }, () => {
      setKeyInputs(prev => ({ ...prev, [activeProvider]: '••••••••' }));
      setSaveStatus(`${activeInfo.label} key saved`);
      setShowKeyInput(false);
      setTimeout(() => setSaveStatus(''), 2500);
    });
  }, [keyInputs, activeProvider, activeInfo]);

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

  const providerOptions = PROVIDERS_LIST.map(p => ({
    value: p,
    label: PROVIDER_INFO[p].label,
    icon: PROVIDER_INFO[p].icon,
    desc: PROVIDER_INFO[p].desc,
  }));

  const modelOptions = activeModels.map(m => ({
    value: m.value,
    label: m.label,
  }));

  return (
    <div className="ff-settings-root">
      {/* ── Toast ── */}
      {saveStatus && (
        <div className="ff-toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {saveStatus}
        </div>
      )}

      {/* ── Provider Card ── */}
      <section className="ff-card">
        <div className="ff-card-header">
          <div className="ff-card-header-dot" />
          <span>LLM Provider</span>
        </div>
        <div className="ff-card-body">
          <div className="ff-field">
            <label className="ff-field-label">Provider</label>
            <CustomDropdown
              id="provider-select"
              value={activeProvider}
              options={providerOptions}
              onChange={handleProviderSelect}
              placeholder="Select a provider"
            />
          </div>

          <div className="ff-field">
            <label className="ff-field-label">Model</label>
            <CustomDropdown
              id="model-select"
              value={currentModel}
              options={modelOptions}
              onChange={handleModelChange}
              placeholder="Select a model"
            />
          </div>

          {/* API Key Section */}
          {activeProvider !== 'ollama-local' && (
            <div className="ff-field">
              <div className="ff-field-label-row">
                <label className="ff-field-label">API Key</label>
                <a
                  href={activeInfo.url}
                  target="_blank"
                  rel="noopener"
                  className="ff-link"
                >
                  Get key ↗
                </a>
              </div>
              {hasKey && !showKeyInput ? (
                <div className="ff-key-saved">
                  <div className="ff-key-saved-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span>Key configured</span>
                  </div>
                  <button
                    className="ff-btn-text"
                    onClick={() => { setShowKeyInput(true); setKeyInputs(prev => ({ ...prev, [activeProvider]: '' })); }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="ff-key-input-row">
                  <input
                    type="password"
                    value={keyInputs[activeProvider]}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder={activeInfo.placeholder}
                    className="ff-input"
                  />
                  <button
                    onClick={handleKeySave}
                    disabled={!keyInputs[activeProvider] || keyInputs[activeProvider] === '••••••••'}
                    className="ff-btn-primary"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Options Card ── */}
      <section className="ff-card">
        <div className="ff-card-header">
          <div className="ff-card-header-dot ff-card-header-dot--teal" />
          <span>Options</span>
        </div>
        <div className="ff-card-body ff-card-body--tight">
          <ToggleSwitch
            checked={settings.fillEEO}
            onChange={() => handleToggle('fillEEO')}
            label="Fill EEO / Demographic fields"
          />
          <ToggleSwitch
            checked={settings.skipExistingContent}
            onChange={() => handleToggle('skipExistingContent')}
            label="Skip fields with existing content"
          />
          <ToggleSwitch
            checked={settings.showConfidenceOverlay}
            onChange={() => handleToggle('showConfidenceOverlay')}
            label="Show fill overlay on page"
          />
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="ff-card ff-card--danger">
        <div className="ff-card-header ff-card-header--danger">
          <div className="ff-card-header-dot ff-card-header-dot--red" />
          <span>Danger Zone</span>
        </div>
        <div className="ff-card-body">
          <p className="ff-danger-text">This will permanently delete all profiles, history, and API keys.</p>
          <button
            id="btn-clear-all"
            onClick={handleClearAll}
            className="ff-btn-danger"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Clear All Data
          </button>
        </div>
      </section>
    </div>
  );
}
