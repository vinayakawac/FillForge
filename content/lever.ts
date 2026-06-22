// ============================================================
// FillForge — Lever ATS Filler
// ============================================================

import type { ProfileData, FillResult } from '../lib/types';
import { fillInput } from './fill-utils';

const LEVER_MAP: Record<string, (p: ProfileData) => string> = {
  'input[name="name"]': p => p.personal.fullName || `${p.personal.firstName} ${p.personal.lastName}`.trim(),
  'input[name="email"]': p => p.personal.email,
  'input[name="phone"]': p => p.personal.phone,
  'input[name="org"]': p => p.work[0]?.company || '',
  'input[name="urls[LinkedIn]"]': p => p.personal.linkedin,
  'input[name="urls[GitHub]"]': p => p.personal.github,
  'input[name="urls[Portfolio]"]': p => p.personal.portfolio,
  'input[name="urls[Twitter]"]': p => p.personal.twitter,
  'input[name="urls[Other]"]': p => p.personal.website,
  'textarea[name="comments"]': () => '', // Never fill
};

export function fillLever(profile: ProfileData, filled: Set<string>): FillResult[] {
  const results: FillResult[] = [];

  for (const [selector, getter] of Object.entries(LEVER_MAP)) {
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

    fillInput(el, value);
    results.push({
      field: key, selector, value,
      method: 'exact-map', confidence: 1.0, filled: true,
    });
    filled.add(key);
  }

  return results;
}
