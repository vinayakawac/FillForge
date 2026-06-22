// ============================================================
// FillForge — iCIMS ATS Filler
// ============================================================

import type { ProfileData, FillResult } from '../lib/types';
import { fillInput, fillSelect } from './fill-utils';

const ICIMS_MAP: Record<string, (p: ProfileData) => string> = {
  'input[id*="FirstName"], input[name*="firstName"]': p => p.personal.firstName,
  'input[id*="LastName"], input[name*="lastName"]': p => p.personal.lastName,
  'input[id*="Email"], input[name*="email"], input[type="email"]': p => p.personal.email,
  'input[id*="Phone"], input[name*="phone"], input[type="tel"]': p => p.personal.phone,
  'input[id*="Address"], input[name*="address"]': p => p.personal.address.street,
  'input[id*="City"], input[name*="city"]': p => p.personal.address.city,
  'input[id*="Zip"], input[name*="zip"], input[name*="postal"]': p => p.personal.address.zip,
  'input[id*="LinkedIn"], input[name*="linkedin"]': p => p.personal.linkedin,
};

export function fillICIMS(profile: ProfileData, filled: Set<string>): FillResult[] {
  const results: FillResult[] = [];

  for (const [selectorGroup, getter] of Object.entries(ICIMS_MAP)) {
    // iCIMS selectors may have multiple options
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
        const success = fillSelect(el, value);
        results.push({
          field: key, selector: key, value,
          method: success ? 'exact-map' : 'skipped',
          confidence: 1.0, filled: success,
          reason: success ? undefined : 'No matching option',
        });
      } else {
        fillInput(el, value);
        results.push({
          field: key, selector: key, value,
          method: 'exact-map', confidence: 1.0, filled: true,
        });
      }

      filled.add(key);
      break; // Only fill first matching selector in group
    }
  }

  return results;
}
