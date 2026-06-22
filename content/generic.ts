// ============================================================
// FillForge — Generic ATS Confidence Scorer
// For unknown ATS platforms — score every input and fill above threshold
// ============================================================

import type { ProfileData, FillResult } from '../lib/types';
import { FIELD_ALIASES, getProfileValue, validateFieldType } from '../lib/field-aliases';
import { fillInput, fillSelect, getFieldSignals, shouldSkipField } from './fill-utils';

const CONFIDENCE_THRESHOLD = 0.7;

export function fillGeneric(
  profile: ProfileData,
  filled: Set<string>,
  options: { fillEEO: boolean; skipExisting: boolean }
): FillResult[] {
  const results: FillResult[] = [];

  // Discover all fillable elements
  const elements = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="image"]), textarea, select'
  );

  for (const el of elements) {
    const key = el.getAttribute('data-automation-id') || el.name || el.id || el.getAttribute('aria-label') || '';
    if (!key || filled.has(key)) continue;

    const signals = getFieldSignals(el);

    // Check if should skip
    const skipCheck = shouldSkipField(el, signals, options);
    if (skipCheck.skip) {
      results.push({
        field: key,
        selector: key,
        value: '',
        method: 'skipped',
        confidence: 0,
        filled: false,
        reason: skipCheck.reason,
      });
      filled.add(key);
      continue;
    }

    // Score against all field aliases
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const [fieldKey, aliases] of Object.entries(FIELD_ALIASES)) {
      for (const signal of signals) {
        for (const alias of aliases) {
          let score = 0;
          if (signal === alias) score = 1.0;
          else if (signal.includes(alias)) score = 0.8;
          else if (alias.includes(signal) && signal.length > 3) score = 0.7;

          if (score > bestScore) {
            bestScore = score;
            bestMatch = fieldKey;
          }
        }
      }
    }

    if (bestScore >= CONFIDENCE_THRESHOLD && bestMatch) {
      const value = getProfileValue(profile, bestMatch);

      if (value && validateFieldType(bestMatch, value)) {
        if (el instanceof HTMLSelectElement) {
          const success = fillSelect(el, value);
          results.push({
            field: key, selector: key, value,
            method: success ? 'scored' : 'skipped',
            confidence: bestScore,
            filled: success,
            reason: success ? undefined : 'No matching dropdown option',
          });
        } else {
          fillInput(el, value);
          results.push({
            field: key, selector: key, value,
            method: 'scored', confidence: bestScore, filled: true,
          });
        }
      } else {
        results.push({
          field: key, selector: key, value: value || '',
          method: 'skipped', confidence: bestScore, filled: false,
          reason: value ? 'Type validation failed' : 'No profile value for match',
        });
      }
    } else if (bestMatch && bestScore > 0) {
      // Below threshold — flag for manual review
      results.push({
        field: key, selector: key, value: '',
        method: 'skipped', confidence: bestScore, filled: false,
        reason: `Low confidence (${(bestScore * 100).toFixed(0)}%) for "${bestMatch}"`,
      });
    }

    filled.add(key);
  }

  return results;
}
