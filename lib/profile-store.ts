// ============================================================
// FillForge — Profile & Settings Storage (chrome.storage.local)
// ============================================================

import type {
  ProfileData,
  FillForgeSettings,
  FieldLocks,
  FillOperation,
  FillResult,
  ProviderType,
} from './types';
import { createEmptyProfile, createDefaultSettings } from './types';
import { encryptKey, decryptKey } from './crypto';

const KEYS = {
  profile: 'fillforge_profile',
  settings: 'fillforge_settings',
  locks: 'fillforge_locks',
  history: 'fillforge_history',
  debugLLM: 'fillforge_debug_llm_response',
  debugFill: 'fillforge_debug_fill_log',
  resumeFilename: 'fillforge_resume_filename',
  parseProvider: 'fillforge_parse_provider',
} as const;

const MAX_HISTORY = 20;

// ---- Profile ----

export async function getProfile(): Promise<ProfileData> {
  const result = await chrome.storage.local.get(KEYS.profile);
  return result[KEYS.profile] || createEmptyProfile();
}

export async function setProfile(profile: ProfileData): Promise<void> {
  await chrome.storage.local.set({ [KEYS.profile]: profile });
}

export async function updateProfileField(path: string, value: unknown): Promise<void> {
  const profile = await getProfile();
  setNestedValue(profile, path, value);
  await setProfile(profile);
}

// ---- Settings ----

export async function getSettings(): Promise<FillForgeSettings> {
  const result = await chrome.storage.local.get(KEYS.settings);
  return result[KEYS.settings] || createDefaultSettings();
}

export async function setSettings(settings: FillForgeSettings): Promise<void> {
  await chrome.storage.local.set({ [KEYS.settings]: settings });
}

export async function setProviderKey(provider: ProviderType, plainKey: string): Promise<void> {
  const settings = await getSettings();
  settings.providers[provider].apiKey = await encryptKey(plainKey);
  await setSettings(settings);
}

export async function getProviderKey(provider: ProviderType): Promise<string> {
  const settings = await getSettings();
  return decryptKey(settings.providers[provider].apiKey);
}

// ---- Field Locks ----

export async function getFieldLocks(): Promise<FieldLocks> {
  const result = await chrome.storage.local.get(KEYS.locks);
  return result[KEYS.locks] || {};
}

export async function setFieldLock(path: string, locked: boolean): Promise<void> {
  const locks = await getFieldLocks();
  if (locked) {
    locks[path] = true;
  } else {
    delete locks[path];
  }
  await chrome.storage.local.set({ [KEYS.locks]: locks });
}

export async function isFieldLocked(path: string): Promise<boolean> {
  const locks = await getFieldLocks();
  return locks[path] === true;
}

// ---- History ----

export async function getHistory(): Promise<FillOperation[]> {
  const result = await chrome.storage.local.get(KEYS.history);
  return result[KEYS.history] || [];
}

export async function addHistoryEntry(entry: FillOperation): Promise<void> {
  const history = await getHistory();
  history.unshift(entry); // newest first
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  await chrome.storage.local.set({ [KEYS.history]: history });
}

// ---- Debug ----

export async function setDebugLLMResponse(response: string): Promise<void> {
  await chrome.storage.local.set({ [KEYS.debugLLM]: response });
}

export async function getDebugLLMResponse(): Promise<string> {
  const result = await chrome.storage.local.get(KEYS.debugLLM);
  return result[KEYS.debugLLM] || '';
}

export async function setDebugFillLog(log: FillResult[]): Promise<void> {
  await chrome.storage.local.set({ [KEYS.debugFill]: log });
}

export async function getDebugFillLog(): Promise<FillResult[]> {
  const result = await chrome.storage.local.get(KEYS.debugFill);
  return result[KEYS.debugFill] || [];
}

// ---- Resume Metadata ----

export async function setResumeFilename(filename: string): Promise<void> {
  await chrome.storage.local.set({ [KEYS.resumeFilename]: filename });
}

export async function getResumeFilename(): Promise<string> {
  const result = await chrome.storage.local.get(KEYS.resumeFilename);
  return result[KEYS.resumeFilename] || '';
}

export async function setParseProvider(provider: ProviderType | null): Promise<void> {
  await chrome.storage.local.set({ [KEYS.parseProvider]: provider });
}

export async function getParseProvider(): Promise<ProviderType | null> {
  const result = await chrome.storage.local.get(KEYS.parseProvider);
  return result[KEYS.parseProvider] || null;
}

// ---- Clear All ----

export async function clearAllData(): Promise<void> {
  await chrome.storage.local.remove(Object.values(KEYS));
}

// ---- Utilities ----

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj as Record<string, unknown>;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}
