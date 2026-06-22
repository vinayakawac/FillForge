// ============================================================
// FillForge — PDF Text Extractor (pdfjs-dist wrapper)
// ============================================================

import * as pdfjsLib from 'pdfjs-dist';

// Configure worker - use bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract full text from a PDF file, preserving newlines.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    let lastY: number | null = null;
    const lines: string[] = [];
    let currentLine = '';

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const textItem = item as { str: string; transform: number[] };

      // Transform[5] is the y-position
      const y = textItem.transform[5];

      if (lastY !== null && Math.abs(y - lastY) > 2) {
        // New line
        lines.push(currentLine);
        currentLine = textItem.str;
      } else {
        currentLine += textItem.str;
      }
      lastY = y;
    }
    if (currentLine) lines.push(currentLine);

    pages.push(lines.join('\n'));
  }

  let text = pages.join('\n\n');

  // Strip null bytes and non-printable characters (except newlines/tabs)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return text;
}

/**
 * Extract PDF as base64 for Gemini vision API.
 */
export async function extractBase64FromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
