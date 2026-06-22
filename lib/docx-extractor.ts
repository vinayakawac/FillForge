// ============================================================
// FillForge — DOCX Text Extractor (mammoth.js wrapper)
// ============================================================

import mammoth from 'mammoth';

/**
 * Extract raw text from a DOCX (or attempt .doc) file.
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });

    let text = result.value;

    // Strip null bytes and non-printable characters
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    if (result.messages.length > 0) {
      console.warn('[FillForge] DOCX extraction warnings:', result.messages);
    }

    return text;
  } catch (error) {
    // This will happen with .doc (legacy binary format) files
    throw new Error(
      `Failed to extract text from document. ${
        file.name.endsWith('.doc')
          ? 'Legacy .doc format is not fully supported — please convert to .docx.'
          : 'The file may be corrupted or in an unsupported format.'
      }`
    );
  }
}
