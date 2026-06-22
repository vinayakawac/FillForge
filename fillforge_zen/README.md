# FillForge - Zen Browser / Firefox Extension

This is the production build of the FillForge extension tailored for Firefox-based browsers (Zen Browser, Mozilla Firefox, LibreWolf, etc.).

## How to Install (Developer Mode)

1. Open your Firefox-based browser (e.g., Zen Browser).
2. Type `about:debugging#/runtime/this-firefox` in the address bar and hit Enter.
3. Under the **Temporary Extensions** section, click the **Load Temporary Add-on...** button.
4. Navigate to this folder (`fillforge_zen`) on your computer.
5. Select the `manifest.json` file inside the folder and click Open.
6. The FillForge extension is now active. You may need to pin it to your toolbar for easy access!

## Getting Started

1. Click the FillForge icon in your browser toolbar.
2. Go to the **Settings** tab.
3. Select your preferred LLM provider (e.g., OpenRouter, Gemini, Groq, Ollama) and enter your API key.
4. Go to the **Profile** tab and upload your PDF or DOCX resume. Wait for the parsing to complete.
5. Navigate to any supported job application page (Workday, Greenhouse, Lever, etc.).
6. Click the FillForge floating action button (or use the popup) to automatically fill the form!

## Note on Firefox Permissions

FillForge requires no external backend. Your resume is parsed entirely client-side inside the browser using local javascript. When you process your resume, the data is sent securely to the LLM API provider you explicitly configured in the Settings. There is zero telemetry or background tracking.
