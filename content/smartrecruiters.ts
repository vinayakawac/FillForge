// ============================================================
// FillForge — SmartRecruiters ATS Filler
// ============================================================

import type { ProfileData, FillResult } from '../lib/types';
import { fillInput, fillSelect } from './fill-utils';

const SMARTRECRUITERS_MAP: Record<string, (p: ProfileData) => string> = {
  'input[name="firstName"], input[id*="firstName"]': p => p.personal.firstName,
  'input[name="lastName"], input[id*="lastName"]': p => p.personal.lastName,
  'input[name="email"], input[id*="email"], input[type="email"]': p => p.personal.email,
  'input[name="phoneNumber"], input[id*="phone"], input[type="tel"]': p => p.personal.phone,
  'input[name="location"], input[id*="location"]': p =>
    [p.personal.address.city, p.personal.address.state].filter(Boolean).join(', '),
  'input[name="linkedin"], input[id*="linkedin"]': p => p.personal.linkedin,
  'input[name="website"], input[id*="website"]': p => p.personal.portfolio || p.personal.website,
};

export function fillSmartRecruiters(profile: ProfileData, filled: Set<string>): FillResult[] {
  const results: FillResult[] = [];

  for (const [selectorGroup, getter] of Object.entries(SMARTRECRUITERS_MAP)) {
    const selectors = selectorGroup.split(', ');

    for (const selector of selectors) {
      const key = selector.trim();
      if (filled.has(key)) continue;

      const value = getter(profile);
      if (!value) continue;

      const el = document.querySelector(key) as HTMLInputElement;
      if (!el) continue;

      if (el.value && el.value.trim() !== '') {
        results.push({
          field: key, selector: key, value: el.value,
          method: 'skipped', confidence: 1.0, filled: false,
          reason: 'Field already has content',
        });
        filled.add(key);
        continue;
      }

      if (el instanceof HTMLSelectElement) {
        fillSelect(el, value);
      } else {
        fillInput(el, value);
      }

      results.push({
        field: key, selector: key, value,
        method: 'exact-map', confidence: 1.0, filled: true,
      });
      filled.add(key);
      break;
    }
  }

  return results;
}
