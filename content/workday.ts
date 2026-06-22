// ============================================================
// FillForge — Workday ATS Filler
// ============================================================

import type { ProfileData, FillResult } from '../lib/types';
import { fillInput, fillWorkdayDropdown } from './fill-utils';

// Workday uses data-automation-id attributes
const WORKDAY_MAP: Record<string, (p: ProfileData) => string | undefined> = {
  'legalNameSection_firstName': p => p.personal.firstName,
  'legalNameSection_lastName': p => p.personal.lastName,
  'preferredName': p => p.personal.firstName,
  'email': p => p.personal.email,
  'phone-number': p => p.personal.phone,
  'addressSection_addressLine1': p => p.personal.address.street,
  'addressSection_city': p => p.personal.address.city,
  'addressSection_postalCode': p => p.personal.address.zip,
  'linkedin': p => p.personal.linkedin,
  'websiteURL': p => p.personal.portfolio || p.personal.website,
  'legalNameSection_middleName': () => undefined,
  'howDidYouHear': () => undefined, // skip — never guess
  'coverLetter': () => undefined,   // skip — never fill
};

function getWorkdayWorkMap(i: number): Record<string, (p: ProfileData) => string | undefined> {
  return {
    [`workExperienceSection_company-${i}`]: p => p.work[i]?.company,
    [`workExperienceSection_jobTitle-${i}`]: p => p.work[i]?.title,
    [`workExperienceSection_startDate-${i}`]: p => {
      const w = p.work[i];
      return w ? `${w.startMonth} ${w.startYear}`.trim() : undefined;
    },
    [`workExperienceSection_endDate-${i}`]: p => {
      const w = p.work[i];
      if (!w) return undefined;
      return w.current ? 'Present' : `${w.endMonth} ${w.endYear}`.trim();
    },
    [`workExperienceSection_description-${i}`]: p => p.work[i]?.bullets?.join('\n') || p.work[i]?.description,
  };
}

function getWorkdayEducationMap(i: number): Record<string, (p: ProfileData) => string | undefined> {
  return {
    [`educationSection_school-${i}`]: p => p.education[i]?.institution,
    [`educationSection_degree-${i}`]: p => p.education[i]?.degree,
    [`educationSection_field-${i}`]: p => p.education[i]?.field,
    [`educationSection_gpa-${i}`]: p => p.education[i]?.gpa,
    [`educationSection_startDate-${i}`]: p => p.education[i]?.startYear,
    [`educationSection_endDate-${i}`]: p => p.education[i]?.endYear,
  };
}

export function fillWorkday(profile: ProfileData, filled: Set<string>): FillResult[] {
  const results: FillResult[] = [];

  // Build complete field map
  const fieldMap: Record<string, (p: ProfileData) => string | undefined> = {
    ...WORKDAY_MAP,
  };

  // Add work experience maps (up to 10 entries)
  for (let i = 0; i < Math.min(profile.work.length, 10); i++) {
    Object.assign(fieldMap, getWorkdayWorkMap(i));
  }

  // Add education maps (up to 5 entries)
  for (let i = 0; i < Math.min(profile.education.length, 5); i++) {
    Object.assign(fieldMap, getWorkdayEducationMap(i));
  }

  // Find and fill all mapped fields
  for (const [automationId, getter] of Object.entries(fieldMap)) {
    if (filled.has(automationId)) continue;

    const value = getter(profile);
    if (value === undefined || value === null) {
      results.push({
        field: automationId, selector: `[data-automation-id="${automationId}"]`,
        value: '', method: 'skipped', confidence: 1.0, filled: false,
        reason: 'No value mapped',
      });
      continue;
    }

    const el = document.querySelector(`[data-automation-id="${automationId}"]`) as HTMLInputElement;
    if (!el) continue;

    // Skip if already has content
    if (el.value && el.value.trim() !== '') {
      results.push({
        field: automationId, selector: `[data-automation-id="${automationId}"]`,
        value: el.value, method: 'skipped', confidence: 1.0, filled: false,
        reason: 'Field already has content',
      });
      filled.add(automationId);
      continue;
    }

    const strValue = String(value);

    if (el.tagName === 'SELECT' || el.getAttribute('role') === 'listbox') {
      // Dropdown
      fillWorkdayDropdown(automationId, strValue).then(success => {
        if (!success) {
          results.push({
            field: automationId, selector: `[data-automation-id="${automationId}"]`,
            value: strValue, method: 'skipped', confidence: 1.0, filled: false,
            reason: 'No matching dropdown option',
          });
        }
      });
    } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      fillInput(el, strValue);
      results.push({
        field: automationId, selector: `[data-automation-id="${automationId}"]`,
        value: strValue, method: 'exact-map', confidence: 1.0, filled: true,
      });
    }

    filled.add(automationId);
  }

  // Handle currentlyWorkHere checkboxes
  for (let i = 0; i < profile.work.length; i++) {
    const automationId = `workExperienceSection_currentlyWorkHere-${i}`;
    if (filled.has(automationId)) continue;

    const checkbox = document.querySelector(`[data-automation-id="${automationId}"]`) as HTMLInputElement;
    if (checkbox && profile.work[i]?.current) {
      if (!checkbox.checked) checkbox.click();
      results.push({
        field: automationId, selector: `[data-automation-id="${automationId}"]`,
        value: 'true', method: 'exact-map', confidence: 1.0, filled: true,
      });
      filled.add(automationId);
    }
  }

  return results;
}
