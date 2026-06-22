// ============================================================
// FillForge — Content Script
// Injected on all pages, detects ATS and delegates filling
// ============================================================

import { detectATS } from '../lib/ats-detector';
import { FillOrchestrator } from '../content/orchestrator';
import { showFilling, showResults, destroyOverlay } from '../content/overlay';
import type { ProfileData, FillForgeSettings, FillResult } from '../lib/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main(_ctx) {
    let orchestrator: FillOrchestrator | null = null;

    // Listen for commands from background/popup
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'TOGGLE_UI') {
        import('../content/ui-overlay').then(({ toggleUI }) => {
          toggleUI();
        });
        sendResponse({ success: true });
        return false;
      }
      
      if (message.type === 'CLOSE_UI') {
        import('../content/ui-overlay').then(({ closeUI }) => {
          closeUI();
        });
        sendResponse({ success: true });
        return false;
      }

      if (message.type === 'EXECUTE_FILL') {
        const { profile, settings } = message.payload as {
          profile: ProfileData;
          settings: FillForgeSettings;
        };

        executeFill(profile, settings)
          .then(results => sendResponse({ success: true, results }))
          .catch(err => sendResponse({ error: err.message }));

        return true; // async
      }

      if (message.type === 'PING') {
        sendResponse({ alive: true });
        return false;
      }
    });

    async function executeFill(profile: ProfileData, settings: FillForgeSettings): Promise<FillResult[]> {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const platform = detectATS(hostname, pathname);

      console.log(`[FillForge] Detected ATS platform: ${platform} on ${hostname}`);

      // Show overlay
      if (settings.showConfidenceOverlay) {
        showFilling(0);
      }

      return new Promise((resolve) => {
        // Destroy previous orchestrator if any
        if (orchestrator) {
          orchestrator.destroy();
        }

        orchestrator = new FillOrchestrator(platform, profile, settings, (results) => {
          // Update overlay with live results
          if (settings.showConfidenceOverlay) {
            showResults(results);
          }
        });

        // Give the orchestrator time to scan and fill (initial + mutation-triggered)
        setTimeout(() => {
          const results = orchestrator!.getResults();

          // Report results back to background for history
          chrome.runtime.sendMessage({
            type: 'FILL_RESULT',
            payload: {
              results,
              site: document.title || hostname,
              hostname,
              platform,
            },
          });

          // Show final overlay
          if (settings.showConfidenceOverlay) {
            showResults(results);
          }

          resolve(results);
        }, 1500);
      });
    }
  },
});
