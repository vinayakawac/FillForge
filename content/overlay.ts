// ============================================================
// FillForge — In-Page Fill Overlay
// Minimal non-intrusive status bar during filling
// ============================================================

import type { FillResult } from '../lib/types';

const OVERLAY_ID = 'fillforge-overlay-root';

const OVERLAY_CSS = `
  :host {
    all: initial;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    pointer-events: none;
  }

  .ff-bar {
    background: #0f0f0f;
    border-bottom: 1px solid #2e2e2e;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: #e8e8e8;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-100%);
    transition: opacity 150ms ease, transform 150ms ease;
  }

  .ff-bar.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .ff-bar .ff-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ff-bar .ff-logo {
    font-weight: 600;
    color: #6b7cff;
  }

  .ff-bar .ff-message {
    color: #e8e8e8;
  }

  .ff-bar .ff-toggle {
    cursor: pointer;
    color: #888888;
    font-size: 12px;
    text-decoration: underline;
    border: none;
    background: none;
    font-family: inherit;
  }

  .ff-bar .ff-toggle:hover {
    color: #8b9aff;
  }

  .ff-details {
    background: #1a1a1a;
    border-bottom: 1px solid #2e2e2e;
    max-height: 200px;
    overflow-y: auto;
    display: none;
    pointer-events: auto;
  }

  .ff-details.expanded {
    display: block;
  }

  .ff-detail-row {
    padding: 4px 16px;
    font-size: 12px;
    border-bottom: 1px solid #232323;
    display: flex;
    gap: 12px;
  }

  .ff-detail-row .ff-field {
    color: #888888;
    min-width: 140px;
  }

  .ff-detail-row .ff-value {
    color: #e8e8e8;
    flex: 1;
  }

  .ff-detail-row.filled .ff-field::before {
    content: '✓ ';
    color: #4caf82;
  }

  .ff-detail-row.skipped .ff-field::before {
    content: '— ';
    color: #e8a838;
  }

  .ff-success { color: #4caf82; }
  .ff-warning { color: #e8a838; }
`;

let overlayHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function ensureOverlay(): { bar: HTMLElement; details: HTMLElement } {
  if (!overlayHost) {
    overlayHost = document.createElement('div');
    overlayHost.id = OVERLAY_ID;
    shadowRoot = overlayHost.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = OVERLAY_CSS;
    shadowRoot.appendChild(style);

    const bar = document.createElement('div');
    bar.className = 'ff-bar';
    bar.innerHTML = `
      <div class="ff-status">
        <span class="ff-logo">FillForge</span>
        <span class="ff-message">Initializing...</span>
      </div>
      <button class="ff-toggle">Details</button>
    `;
    shadowRoot.appendChild(bar);

    const details = document.createElement('div');
    details.className = 'ff-details';
    shadowRoot.appendChild(details);

    // Toggle details
    bar.querySelector('.ff-toggle')!.addEventListener('click', () => {
      details.classList.toggle('expanded');
      if (dismissTimer) {
        clearTimeout(dismissTimer);
        dismissTimer = null;
      }
    });

    document.body.appendChild(overlayHost);
  }

  return {
    bar: shadowRoot!.querySelector('.ff-bar')!,
    details: shadowRoot!.querySelector('.ff-details')!,
  };
}

export function showFilling(totalFields: number): void {
  const { bar } = ensureOverlay();
  const message = bar.querySelector('.ff-message')!;
  message.textContent = `filling ${totalFields} fields...`;
  bar.classList.add('visible');
}

export function showResults(results: FillResult[]): void {
  const { bar, details } = ensureOverlay();
  const filledCount = results.filter(r => r.filled).length;
  const skippedCount = results.filter(r => !r.filled).length;

  const message = bar.querySelector('.ff-message')!;
  message.innerHTML = `<span class="ff-success">✓ ${filledCount} filled</span>, <span class="ff-warning">${skippedCount} skipped</span>`;
  bar.classList.add('visible');

  // Populate details
  details.innerHTML = results
    .map(r => `
      <div class="ff-detail-row ${r.filled ? 'filled' : 'skipped'}">
        <span class="ff-field">${r.field}</span>
        <span class="ff-value">${r.filled ? r.value : (r.reason || 'Skipped')}</span>
      </div>
    `)
    .join('');

  // Auto-dismiss after 4 seconds
  if (dismissTimer) clearTimeout(dismissTimer);
  dismissTimer = setTimeout(() => {
    bar.classList.remove('visible');
    details.classList.remove('expanded');
  }, 4000);
}

export function hideOverlay(): void {
  if (overlayHost) {
    const bar = shadowRoot!.querySelector('.ff-bar')!;
    bar.classList.remove('visible');
    const details = shadowRoot!.querySelector('.ff-details')!;
    details.classList.remove('expanded');
  }
}

export function destroyOverlay(): void {
  if (overlayHost && overlayHost.parentNode) {
    overlayHost.parentNode.removeChild(overlayHost);
    overlayHost = null;
    shadowRoot = null;
  }
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}
