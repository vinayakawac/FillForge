// ============================================================
// FillForge — Fill Orchestrator
// MutationObserver-driven form filling coordinator
// ============================================================

import type { ATSPlatform, ProfileData, FillResult, FillForgeSettings } from '../lib/types';
import { fillWorkday } from './workday';
import { fillGreenhouse } from './greenhouse';
import { fillLever } from './lever';
import { fillICIMS } from './icims';
import { fillTaleo } from './taleo';
import { fillSmartRecruiters } from './smartrecruiters';
import { fillGeneric } from './generic';

export class FillOrchestrator {
  private platform: ATSPlatform;
  private profile: ProfileData;
  private settings: FillForgeSettings;
  private filled: Set<string> = new Set();
  private observer: MutationObserver;
  private allResults: FillResult[] = [];
  private onUpdate: (results: FillResult[]) => void;

  constructor(
    platform: ATSPlatform,
    profile: ProfileData,
    settings: FillForgeSettings,
    onUpdate: (results: FillResult[]) => void
  ) {
    this.platform = platform;
    this.profile = profile;
    this.settings = settings;
    this.onUpdate = onUpdate;

    this.observer = new MutationObserver(this.onMutation.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    // Initial scan
    this.scanAndFill();
  }

  private onMutation(mutations: MutationRecord[]): void {
    const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
    if (hasNewNodes) {
      // Small debounce to let the DOM settle
      setTimeout(() => this.scanAndFill(), 100);
    }
  }

  private scanAndFill(): void {
    const fillOptions = {
      fillEEO: this.settings.fillEEO,
      skipExisting: this.settings.skipExistingContent,
    };

    let results: FillResult[] = [];

    switch (this.platform) {
      case 'workday':
        results = fillWorkday(this.profile, this.filled);
        break;
      case 'greenhouse':
        results = fillGreenhouse(this.profile, this.filled);
        break;
      case 'lever':
        results = fillLever(this.profile, this.filled);
        break;
      case 'icims':
        results = fillICIMS(this.profile, this.filled);
        break;
      case 'taleo':
        results = fillTaleo(this.profile, this.filled);
        break;
      case 'smartrecruiters':
        results = fillSmartRecruiters(this.profile, this.filled);
        break;
      case 'jobvite':
      case 'ashby':
      case 'rippling':
      default:
        // Fall through to generic for all unimplemented platforms
        results = fillGeneric(this.profile, this.filled, fillOptions);
        break;
    }

    // For platform-specific fillers, also run generic to catch any fields they missed
    if (this.platform !== 'generic' && results.length > 0) {
      const genericResults = fillGeneric(this.profile, this.filled, fillOptions);
      results = [...results, ...genericResults];
    }

    if (results.length > 0) {
      this.allResults = [...this.allResults, ...results];
      this.onUpdate(this.allResults);
    }
  }

  public getResults(): FillResult[] {
    return this.allResults;
  }

  public getFilledCount(): number {
    return this.allResults.filter(r => r.filled).length;
  }

  public getSkippedCount(): number {
    return this.allResults.filter(r => !r.filled).length;
  }

  public destroy(): void {
    this.observer.disconnect();
  }
}
