// ============================================================
// FillForge — UI Overlay Manager
// Injects the React App as an iframe in the Shadow DOM
// ============================================================

let uiContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let iframe: HTMLIFrameElement | null = null;

// Listen for messages from the iframe React app
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLOSE_UI') {
    closeUI();
  }
});

export function toggleUI() {
  if (uiContainer) {
    closeUI();
  } else {
    openUI();
  }
}

export function openUI() {
  if (uiContainer) return;

  uiContainer = document.createElement('div');
  // Use extreme z-index to ensure it's on top of everything
  uiContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    max-height: calc(100vh - 40px);
    z-index: 2147483647;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
    background: transparent;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  `;

  // Use Shadow DOM to isolate styles
  shadowRoot = uiContainer.attachShadow({ mode: 'closed' });

  iframe = document.createElement('iframe');
  // Load the React app from web accessible resources
  iframe.src = chrome.runtime.getURL('/ui.html');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
    border-radius: 12px;
  `;

  shadowRoot.appendChild(iframe);
  document.body.appendChild(uiContainer);

  // Trigger animation
  requestAnimationFrame(() => {
    if (uiContainer) {
      uiContainer.style.opacity = '1';
      uiContainer.style.transform = 'translateY(0)';
    }
  });
}

export function closeUI() {
  if (!uiContainer) return;

  uiContainer.style.opacity = '0';
  uiContainer.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    if (uiContainer && uiContainer.parentNode) {
      uiContainer.parentNode.removeChild(uiContainer);
    }
    uiContainer = null;
    shadowRoot = null;
    iframe = null;
  }, 200);
}
