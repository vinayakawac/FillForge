// ============================================================
// FillForge — Fill Utilities
// React/Angular-safe input filling + dropdown handling
// ============================================================

import { isBlockedField, isEEOField } from '../lib/field-aliases';

/**
 * Fill an input element safely for React/Angular controlled components.
 * Uses native property setter + event dispatch.
 */
export function fillInput(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  el.focus();

  const proto = Object.getPrototypeOf(el);
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  if (descriptor?.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  el.blur();
}

/**
 * Fill a checkbox or radio input.
 */
export function fillCheckbox(el: HTMLInputElement, checked: boolean): void {
  if (el.checked === checked) return;
  el.focus();
  el.click();
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur();
}

/**
 * Fill a native <select> element.
 */
export function fillSelect(el: HTMLSelectElement, value: string): boolean {
  const target = value.toLowerCase().trim();
  let matched = false;

  for (const option of el.options) {
    const text = option.textContent?.trim().toLowerCase() || '';
    const val = option.value.toLowerCase();

    if (text === target || val === target || text.includes(target) || target.includes(text)) {
      el.value = option.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      matched = true;
      break;
    }
  }

  return matched;
}

/**
 * Wait for an element to appear in the DOM.
 */
export function waitForElement(selector: string, timeout = 2000): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Workday-specific dropdown handler.
 * Clicks trigger, waits for listbox, finds matching option.
 */
export async function fillWorkdayDropdown(automationId: string, value: string): Promise<boolean> {
  const trigger = document.querySelector(`[data-automation-id="${automationId}"]`) as HTMLElement;
  if (!trigger) return false;

  trigger.click();

  const listbox = await waitForElement(
    `[data-automation-id="${automationId}-listbox"], [role="listbox"]`,
    2000
  );
  if (!listbox) return false;

  const options = listbox.querySelectorAll('[role="option"], li');
  const target = value.toLowerCase().trim();

  for (const opt of options) {
    const text = (opt as HTMLElement).textContent?.trim().toLowerCase() || '';
    if (text === target || text.includes(target) || target.includes(text)) {
      (opt as HTMLElement).click();
      return true;
    }
  }

  // No match — close dropdown, do not leave it open or filled wrong
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return false;
}

/**
 * Generic dropdown handler for custom dropdown components.
 */
export async function fillGenericDropdown(el: HTMLElement, value: string): Promise<boolean> {
  el.click();
  await new Promise(r => setTimeout(r, 300));

  const target = value.toLowerCase().trim();

  // Look for options in various patterns
  const selectors = [
    '[role="option"]',
    '[role="listbox"] li',
    '.dropdown-option',
    '.option',
    '[class*="option"]',
    'ul li',
  ];

  for (const selector of selectors) {
    const options = document.querySelectorAll(selector);
    for (const opt of options) {
      const text = (opt as HTMLElement).textContent?.trim().toLowerCase() || '';
      if (text === target || text.includes(target) || target.includes(text)) {
        (opt as HTMLElement).click();
        return true;
      }
    }
  }

  // Close by pressing Escape
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return false;
}

/**
 * Get all text signals from an element (name, id, label, placeholder, etc.)
 */
export function getFieldSignals(el: HTMLElement): string[] {
  const signals: string[] = [];

  const attrs = ['name', 'id', 'placeholder', 'aria-label', 'data-field',
    'data-automation-id', 'autocomplete', 'data-testid'];

  for (const attr of attrs) {
    const val = el.getAttribute(attr);
    if (val) signals.push(val);
  }

  // Associated label
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label?.textContent) signals.push(label.textContent);
  }

  // Parent label
  const parentLabel = el.closest('label');
  if (parentLabel?.textContent) signals.push(parentLabel.textContent);

  // Closest form group label
  const formGroup = el.closest('[class*="field"], [class*="form-group"], [class*="form_field"], [class*="FormField"]');
  if (formGroup) {
    const label = formGroup.querySelector('label, .label, [class*="label"]');
    if (label?.textContent) signals.push(label.textContent);
  }

  return signals.filter(Boolean).map(s => s.toLowerCase().trim());
}

/**
 * Check if a field should be skipped entirely.
 */
export function shouldSkipField(
  el: HTMLElement,
  signals: string[],
  options: { fillEEO: boolean; skipExisting: boolean }
): { skip: boolean; reason?: string } {
  // Never fill file inputs
  if (el instanceof HTMLInputElement && el.type === 'file') {
    return { skip: true, reason: 'File input' };
  }

  // Never fill hidden inputs
  if (el instanceof HTMLInputElement && el.type === 'hidden') {
    return { skip: true, reason: 'Hidden input' };
  }

  // Never fill password fields
  if (el instanceof HTMLInputElement && el.type === 'password') {
    return { skip: true, reason: 'Password field' };
  }

  // Check if field already has content
  if (options.skipExisting) {
    const value = (el as HTMLInputElement).value;
    if (value && value.trim() !== '') {
      return { skip: true, reason: 'Field already has content' };
    }
  }

  // Check for blocked fields (cover letter, SSN, etc.)
  for (const signal of signals) {
    if (isBlockedField(signal)) {
      return { skip: true, reason: `Blocked field: ${signal}` };
    }
  }

  // Check for EEO/demographic fields
  if (!options.fillEEO) {
    for (const signal of signals) {
      if (isEEOField(signal)) {
        return { skip: true, reason: 'EEO field (disabled in settings)' };
      }
    }
  }

  return { skip: false };
}
