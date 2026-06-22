# FillForge Troubleshooting Guide 🛠️

If you are experiencing issues with FillForge, check the following common problems and their solutions.

---

## 1. Extension Does Not Load / Errors on Installation
**Problem:** You get a manifest error or "Failed to load extension" when trying to load unpacked.
**Solutions:**
- **Chrome/Edge:** Ensure you are selecting the `.output/chrome-mv3` directory, *not* the root of the project.
- **Firefox:** Ensure you are selecting the `manifest.json` inside the `.output/firefox-mv2` directory. Firefox requires loading the manifest directly via `about:debugging`.
- If you made code changes, ensure you ran `npm run build:chrome` or `npm run build:firefox` to generate the latest output files.

## 2. API Key or Provider Errors
**Problem:** The extension throws an error when trying to parse a resume (e.g., "Invalid API Key" or "Rate Limit Exceeded").
**Solutions:**
- **Double Check Key:** Go to Settings, re-enter your API key, and ensure there are no trailing spaces.
- **Quota Limits:** If you are using a free tier API (like Gemini Free or Groq), you may have hit a rate limit. Wait a minute and try again, or check your provider's dashboard for quota usage.
- **Ollama Users:** Ensure your local Ollama server is running (`ollama serve`), and that the model you selected in Settings is actually pulled locally (e.g., `ollama pull llama3`). Also, ensure Ollama is configured to allow CORS requests from the browser extension.

## 3. Resume Parsing Fails or Misses Data
**Problem:** The Profile tab is missing information, or the LLM failed to extract JSON properly.
**Solutions:**
- **Image-based PDFs:** FillForge relies on text extraction. If your resume is an image-based PDF (a scanned document without selectable text), the local `pdf.js` library cannot read it. Convert your resume to a text-based PDF or DOCX.
- **Complex Layouts:** Highly graphical or multi-column resumes sometimes confuse the text extractors. Try uploading a simpler, single-column version.
- **Check Debug Tab:** Open the extension popup, go to the **Debug** tab, and view the raw LLM output. This will tell you if the LLM hallucinated, failed to return JSON, or missed specific fields.

## 4. ATS Autofill Fails / Fields Remain Empty
**Problem:** You clicked the fill button, but some or all fields on the job application were ignored.
**Solutions:**
- **Unsupported ATS:** Ensure the job board is one of the supported platforms (Workday, Greenhouse, Lever, iCIMS, Taleo, SmartRecruiters). If it is a custom form, the generic fallback filler attempts to match standard HTML `name` or `id` attributes, but custom frameworks often obscure these.
- **Confidence Threshold:** FillForge will *skip* a field if the confidence match is below `0.7` to prevent wrong data entry. 
- **Security Blocks:** FillForge intentionally *never* fills File Upload fields, Cover Letters, Social Security Numbers, or highly subjective fields ("How did you hear about us?"). You must fill these manually.
- **Dynamic Forms (React/Angular):** Some modern forms intercept input. FillForge uses native setters to bypass this, but if the site heavily restricts automated input, try refreshing the page and running the filler again before clicking into any fields manually.

## 5. UI or Styling Issues
**Problem:** The popup looks broken or the floating fill button is invisible.
**Solutions:**
- **CSS Conflicts:** The shadow DOM usually isolates the fill button, but extreme website stylesheets might interfere. You can always trigger the fill action directly from the extension Popup UI instead of using the on-page button.

---

### Still Need Help?
If you've checked the above and are still having issues, check the **Debug** tab in the extension popup. It keeps an ephemeral log of the last parser operation and filling sequence which is highly useful for identifying where things went wrong.
