// ============================================================
// FillForge — Taleo ATS Filler
// ============================================================

import type { ProfileData, FillResult } from '../lib/types';
import { fillInput, fillSelect } from './fill-utils';

const TALEO_MAP: Record<string, (p: ProfileData) => string> = {
  'input[id*="FirstName"], input[name*="FirstName"]': p => p.personal.firstName,
  'input[id*="LastName"], input[name*="LastName"]': p => p.personal.lastName,
  'input[id*="Email"], input[name*="Email"], input[type="email"]': p => p.personal.email,
  'input[id*="Phone"], input[name*="Phone"], input[type="tel"]': p => p.personal.phone,
  'input[id*="Address"], input[name*="Address"]': p => p.personal.address.street,
  'input[id*="City"], input[name*="City"]': p => p.personal.address.city,
  'input[id*="ZipCode"], input[name*="ZipCode"], input[name*="PostalCode"]': p => p.personal.address.zip,
};

export function fillTaleo(profile: ProfileData, filled: Set<string>): FillResult[] {
  const results: FillResult[] = [];

  for (const [selectorGroup, getter] of Object.entries(TALEO_MAP)) {
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
        });
      } else {
        fillInput(el, value);
        results.push({
          field: key, selector: key, value,
          method: 'exact-map', confidence: 1.0, filled: true,
        });
      }

      filled.add(key);
      break;
    }
  }

  return results;
}
