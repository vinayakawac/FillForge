# FillForge

A privacy-first, client-side browser extension that extracts structured data from your PDF/DOCX resume using LLMs, and automatically fills job application forms across major ATS platforms with maximum accuracy.

## Features

- **Privacy First**: Zero backend, no telemetry. Everything runs entirely client-side. Your resume data never leaves your browser except when securely communicating with the LLM API of your choice.
- **Multiple LLM Providers**: Bring your own API key! Supports Gemini, Groq, Ollama (Local), OpenRouter, and more.
- **Smart Parsing**: Extracts complex work history, education, skills, and personal details into a structured profile using a reliable fallback chain.
- **Universal ATS Support**: Confidently autofills applications on Workday, Greenhouse, Lever, iCIMS, Taleo, SmartRecruiters, and fallback generic forms.
- **High Accuracy & Safety Rules**:
  - Requires a strict 0.7+ confidence score before filling.
  - Automatically skips sensitive fields (SSNs, EEO info) and unpredictable fields (Cover Letters, "How did you hear about us?").

## Installation (Developer Mode)

### Chrome / Edge / Brave
1. Clone this repository or download the latest release.
2. Build the extension using `npm run build:chrome` (or locate the `.output/chrome-mv3` folder).
3. Open your browser and navigate to `chrome://extensions`.
4. Enable **Developer Mode** (top right toggle).
5. Click **Load unpacked** and select the `.output/chrome-mv3` folder.

### Firefox / Zen
1. Build the extension using `npm run build:firefox` (or locate the `.output/firefox-mv2` folder).
2. Open your browser and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Select the `manifest.json` file inside the `.output/firefox-mv2` directory.

## Usage

1. **Setup API Key**: Click the FillForge extension icon to open the popup. Go to the **Settings** tab, choose your preferred LLM provider, and paste your API key (it is securely encrypted in your browser's local storage).
2. **Parse Resume**: Go to the **Profile** tab, and upload your PDF or DOCX resume. Wait a few seconds for the LLM to parse your data.
3. **Apply for Jobs**: Navigate to any supported job application page. You will see the FillForge floating action button or you can trigger it via the popup. Click it to autofill the form!

## Tech Stack

The architecture of FillForge is built on a modern, fast, and secure foundation:

- **Framework**: [WXT](https://wxt.dev/) - Next-generation framework for Web Extensions ensuring MV3 compatibility.
- **Frontend library**: React 18
- **Styling**: Tailwind CSS
- **DOM Injection**: Vanilla JS content scripts to keep the DOM footprint minimal and reduce conflicts.
- **Local Parsing**:
  - [pdfjs-dist](https://github.com/mozilla/pdf.js) for PDF text extraction.
  - [mammoth.js](https://github.com/mwilliamson/mammoth.js) for DOCX text extraction.
- **LLM Integrations**: Fetch API using robust adapter pattern for multiple providers.

## License
This project is licensed under the [MIT License](LICENSE).
