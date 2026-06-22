// ============================================================
// FillForge — Greenhouse ATS Filler
// ============================================================

import type { ProfileData, FillResult } from '../lib/types';
import { fillInput, fillSelect } from './fill-utils';

const GREENHOUSE_MAP: Record<string, (p: ProfileData) => string> = {
  '#first_name': p => p.personal.firstName,
  '#last_name': p => p.personal.lastName,
  '#email': p => p.personal.email,
  '#phone': p => p.personal.phone,
  'input[name="job_application[location]"]': p =>
    [p.personal.address.city, p.personal.address.state].filter(Boolean).join(', '),
  'input[autocomplete="organization"]': p => p.work[0]?.company || '',
  '#job_application_linkedin_url': p => p.personal.linkedin,
  '#job_application_website': p => p.personal.portfolio || p.personal.website,
};

export function fillGreenhouse(profile: ProfileData, filled: Set<string>): FillResult[] {
  const results: FillResult[] = [];

  for (const [selector, getter] of Object.entries(GREENHOUSE_MAP)) {
    const key = selector;
    if (filled.has(key)) continue;

    const value = getter(profile);
    if (!value) continue;

    const el = document.querySelector(selector) as HTMLInputElement;
    if (!el) continue;

    if (el.value && el.value.trim() !== '') {
      results.push({
        field: key, selector, value: el.value,
        method: 'skipped', confidence: 1.0, filled: false,
        reason: 'Field already has content',
      });
      filled.add(key);
      continue;
    }

    if (el instanceof HTMLSelectElement) {
      const success = fillSelect(el, value);
      results.push({
        field: key, selector, value,
        method: success ? 'exact-map' : 'skipped',
        confidence: 1.0, filled: success,
        reason: success ? undefined : 'No matching option',
      });
    } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      fillInput(el, value);
      results.push({
        field: key, selector, value,
        method: 'exact-map', confidence: 1.0, filled: true,
      });
    }

    filled.add(key);
  }

  return results;
}
