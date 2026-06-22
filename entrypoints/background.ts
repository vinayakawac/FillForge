// ============================================================
// FillForge — Background Service Worker
// ============================================================

import { parseResume, type ParseResult } from '../lib/resume-parser';
import {
  getProfile, setProfile, getSettings, setSettings,
  getFieldLocks, setFieldLock, getHistory, addHistoryEntry,
  setDebugLLMResponse, setDebugFillLog, getDebugLLMResponse, getDebugFillLog,
  setResumeFilename, getResumeFilename, setParseProvider, getParseProvider,
  clearAllData, setProviderKey, updateProfileField,
} from '../lib/profile-store';
import type { FillOperation, FillResult, ProviderType } from '../lib/types';

export default defineBackground(() => {
  console.log('[FillForge] Background service worker started');

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch(err => {
      console.error('[FillForge] Message handler error:', err);
      sendResponse({ error: err.message || String(err) });
    });
    return true; // Keep message channel open for async response
  });
});

async function handleMessage(message: { type: string; payload?: unknown }): Promise<unknown> {
  switch (message.type) {
    case 'PARSE_RESUME': {
      const { fileData, fileName, fileType } = message.payload as {
        fileData: string; // base64 data URL
        fileName: string;
        fileType: string;
      };

      // Reconstruct File from base64
      const response = await fetch(fileData);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: fileType });

      const settings = await getSettings();
      const existingProfile = await getProfile();
      const locks = await getFieldLocks();

      const result: ParseResult = await parseResume(file, settings, existingProfile, locks);

      // Store results
      await setProfile(result.profile);
      await setDebugLLMResponse(result.rawResponse);
      await setResumeFilename(fileName);
      await setParseProvider(result.provider);

      return {
        success: !result.error,
        profile: result.profile,
        provider: result.provider,
        error: result.error,
        warnings: result.warnings,
      };
    }

    case 'GET_PROFILE': {
      const profile = await getProfile();
      const filename = await getResumeFilename();
      const parseProvider = await getParseProvider();
      return { profile, filename, parseProvider };
    }

    case 'UPDATE_PROFILE': {
      const { path, value } = message.payload as { path: string; value: unknown };
      await updateProfileField(path, value);
      return { success: true };
    }

    case 'LOCK_FIELD': {
      const { path, locked } = message.payload as { path: string; locked: boolean };
      await setFieldLock(path, locked);
      return { success: true };
    }

    case 'GET_LOCKS': {
      const locks = await getFieldLocks();
      return { locks };
    }

    case 'FILL_PAGE': {
      // Get the active tab and send fill message to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return { error: 'No active tab found' };

      const profile = await getProfile();
      const settings = await getSettings();

      // Inject content script if needed, then send message
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-scripts/content.js'],
        });
      } catch {
        // Content script may already be injected
      }

      return new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id!, {
          type: 'EXECUTE_FILL',
          payload: { profile, settings },
        }, (response) => {
          resolve(response || { error: 'No response from content script' });
        });
      });
    }

    case 'FILL_RESULT': {
      // Content script reports fill results
      const { results, site, hostname, platform } = message.payload as {
        results: FillResult[];
        site: string;
        hostname: string;
        platform: string;
      };

      const entry: FillOperation = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        site,
        hostname,
        platform: platform as FillOperation['platform'],
        date: Date.now(),
        results,
        filledCount: results.filter(r => r.filled).length,
        skippedCount: results.filter(r => !r.filled).length,
      };

      await addHistoryEntry(entry);
      await setDebugFillLog(results);

      return { success: true, entry };
    }

    case 'GET_SETTINGS': {
      const settings = await getSettings();
      return { settings };
    }

    case 'UPDATE_SETTINGS': {
      const settings = message.payload as Partial<{ settings: unknown }>;
      if (settings.settings) {
        await setSettings(settings.settings as ReturnType<typeof getSettings> extends Promise<infer T> ? T : never);
      }
      return { success: true };
    }

    case 'SET_PROVIDER_KEY': {
      const { provider, key } = message.payload as { provider: ProviderType; key: string };
      await setProviderKey(provider, key);
      return { success: true };
    }

    case 'GET_HISTORY': {
      const history = await getHistory();
      return { history };
    }

    case 'GET_DEBUG': {
      const llmResponse = await getDebugLLMResponse();
      const fillLog = await getDebugFillLog();
      return { llmResponse, fillLog };
    }

    case 'CLEAR_ALL_DATA': {
      await clearAllData();
      return { success: true };
    }

    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}
