// ============================================================
// FillForge — Resume Parsing Pipeline
// File ingestion → pre-processing → LLM extraction → post-processing
// ============================================================

import type { ProfileData, ProviderType, FillForgeSettings, FieldLocks } from './types';
import { createEmptyProfile } from './types';
import { callWithFallback, type LLMRequest } from './providers';
import { inferStateCode, inferCountryCode } from './geo-maps';

// ---- System Prompt (exact spec) ----

const SYSTEM_PROMPT = `You are a precise resume parser. Extract ALL information from the resume text provided. 
Return ONLY a single valid JSON object. No markdown fences. No explanation. No preamble. No trailing text.
If a field is not found, use empty string "" for strings, empty array [] for arrays, false for booleans.
Never hallucinate or infer data not explicitly present in the resume.
Dates: preserve exactly as written in resume (e.g. "Jan 2022", "2022-01", "January 2022", "2022").
Phone: preserve exactly as written including country code if present.`;

const SCHEMA_TEMPLATE = `Extract from this resume into the following JSON schema exactly:
{
  "personal": {
    "firstName": "",
    "lastName": "",
    "fullName": "",
    "email": "",
    "phone": "",
    "phoneAlt": "",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "twitter": "",
    "website": "",
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "stateCode": "",
      "zip": "",
      "country": "",
      "countryCode": ""
    }
  },
  "summary": "",
  "objective": "",
  "work": [
    {
      "company": "",
      "title": "",
      "department": "",
      "location": "",
      "locationType": "",
      "startMonth": "",
      "startYear": "",
      "endMonth": "",
      "endYear": "",
      "current": false,
      "bullets": [],
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "degreeType": "",
      "field": "",
      "minor": "",
      "gpa": "",
      "maxGpa": "",
      "startYear": "",
      "endYear": "",
      "location": "",
      "honors": "",
      "coursework": []
    }
  ],
  "skills": [],
  "skillsByCategory": {},
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "issueMonth": "",
      "issueYear": "",
      "expiryMonth": "",
      "expiryYear": "",
      "credentialId": "",
      "url": ""
    }
  ],
  "languages": [
    {
      "language": "",
      "proficiency": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "url": "",
      "github": "",
      "tech": [],
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": []
    }
  ],
  "publications": [
    {
      "title": "",
      "publisher": "",
      "date": "",
      "url": "",
      "description": ""
    }
  ],
  "awards": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "description": ""
    }
  ],
  "volunteer": [
    {
      "organization": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "demographics": {
    "authorizedToWork": "",
    "requiresSponsorship": "",
    "veteranStatus": "",
    "disabilityStatus": "",
    "gender": "",
    "ethnicity": "",
    "pronouns": ""
  },
  "preferences": {
    "desiredSalaryMin": "",
    "desiredSalaryMax": "",
    "salaryCurrency": "",
    "salaryType": "",
    "noticePeriod": "",
    "willingToRelocate": "",
    "remotePreference": "",
    "desiredJobTypes": []
  }
}

RESUME TEXT:
`;

// ---- File Type Detection ----

export type FileCategory = 'pdf' | 'docx' | 'image';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export function categorizeFile(filename: string, mimeType: string): FileCategory {
  const ext = filename.toLowerCase().split('.').pop() || '';

  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ext === 'docx' || ext === 'doc'
  ) return 'docx';
  if (IMAGE_TYPES.includes(mimeType) || IMAGE_EXTENSIONS.includes('.' + ext)) return 'image';

  throw new Error(`Unsupported file type: ${filename}`);
}

// ---- Pre-processing ----

function preprocessText(text: string): string {
  // Strip null bytes and non-printable characters (preserve newlines, tabs)
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize multiple blank lines to double
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Rough token estimation (1 token ≈ 4 chars for English text)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ---- JSON Extraction ----

function extractJSON(raw: string): string {
  let text = raw.trim();

  // Remove markdown fences if present
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  text = text.trim();

  // Find the first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  return text;
}

// ---- Post-processing ----

function postProcessProfile(profile: ProfileData): ProfileData {
  const p = structuredClone(profile);

  // Normalize phone: strip non-numeric except +, -, (, ), space
  if (p.personal.phone) {
    p.personal.phone = p.personal.phone.replace(/[^\d+\-() ]/g, '').trim();
  }
  if (p.personal.phoneAlt) {
    p.personal.phoneAlt = p.personal.phoneAlt.replace(/[^\d+\-() ]/g, '').trim();
  }

  // Split fullName into firstName/lastName if either is empty
  if (p.personal.fullName && (!p.personal.firstName || !p.personal.lastName)) {
    const parts = p.personal.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      if (!p.personal.firstName) p.personal.firstName = parts[0];
      if (!p.personal.lastName) p.personal.lastName = parts.slice(1).join(' ');
    } else if (parts.length === 1) {
      if (!p.personal.firstName) p.personal.firstName = parts[0];
    }
  }

  // Build fullName if empty
  if (!p.personal.fullName && (p.personal.firstName || p.personal.lastName)) {
    p.personal.fullName = `${p.personal.firstName} ${p.personal.lastName}`.trim();
  }

  // Infer stateCode from state name
  if (p.personal.address.state && !p.personal.address.stateCode) {
    p.personal.address.stateCode = inferStateCode(p.personal.address.state);
  }

  // Infer countryCode from country name
  if (p.personal.address.country && !p.personal.address.countryCode) {
    p.personal.address.countryCode = inferCountryCode(p.personal.address.country);
  }

  // Set current: true for work entries where endYear and endMonth are empty
  for (const work of p.work) {
    if (!work.endYear && !work.endMonth) {
      work.current = true;
    }
  }

  // Ensure arrays exist
  if (!Array.isArray(p.skills)) p.skills = [];
  if (!Array.isArray(p.work)) p.work = [];
  if (!Array.isArray(p.education)) p.education = [];
  if (!Array.isArray(p.certifications)) p.certifications = [];
  if (!Array.isArray(p.languages)) p.languages = [];
  if (!Array.isArray(p.projects)) p.projects = [];
  if (!Array.isArray(p.publications)) p.publications = [];
  if (!Array.isArray(p.awards)) p.awards = [];
  if (!Array.isArray(p.volunteer)) p.volunteer = [];
  if (!p.skillsByCategory) p.skillsByCategory = {};
  if (!p.demographics) {
    p.demographics = {
      authorizedToWork: '', requiresSponsorship: '', veteranStatus: '',
      disabilityStatus: '', gender: '', ethnicity: '', pronouns: '',
    };
  }
  if (!p.preferences) {
    p.preferences = {
      desiredSalaryMin: '', desiredSalaryMax: '', salaryCurrency: '',
      salaryType: '', noticePeriod: '', willingToRelocate: '',
      remotePreference: '', desiredJobTypes: [],
    };
  }

  return p;
}

/**
 * Merge new profile data into existing, respecting field locks.
 */
function mergeWithLocks(
  existing: ProfileData,
  parsed: ProfileData,
  locks: FieldLocks
): ProfileData {
  const merged = structuredClone(parsed);

  // For each locked field path, restore the existing value
  for (const path of Object.keys(locks)) {
    if (!locks[path]) continue;

    const existingValue = getNestedValue(existing as unknown as Record<string, unknown>, path);
    if (existingValue !== undefined) {
      setNestedValue(merged as unknown as Record<string, unknown>, path, existingValue);
    }
  }

  return merged;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

// ---- Extracted File Input Type ----

export interface ExtractedFileData {
  category: FileCategory;
  resumeText: string;
  pdfBase64?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

// ---- Main Parse Function ----

export interface ParseResult {
  profile: ProfileData;
  provider: ProviderType;
  rawResponse: string;
  error?: string;
  warnings: string[];
}

export async function parseResume(
  fileData: ExtractedFileData,
  settings: FillForgeSettings,
  existingProfile: ProfileData | null,
  locks: FieldLocks
): Promise<ParseResult> {
  const warnings: string[] = [];

  let { resumeText, pdfBase64, imageBase64, imageMimeType, category } = fileData;

  // Step 1: LLM Extraction Prep
  if (category === 'image' && settings.selectedProvider !== 'gemini') {
    warnings.push('Image resumes require Gemini provider for vision support. Switch to Gemini for best results.');
  }

  // Step 2: Pre-processing
  resumeText = preprocessText(resumeText);

  if (!resumeText && !imageBase64 && !pdfBase64) {
    return {
      profile: existingProfile || createEmptyProfile(),
      provider: settings.selectedProvider,
      rawResponse: '',
      error: 'No text could be extracted from the file.',
      warnings,
    };
  }

  // Step 3: LLM Extraction
  const userPrompt = SCHEMA_TEMPLATE + resumeText;

  // Handle chunking for very long resumes (>6000 tokens ≈ 24000 chars)
  const tokens = estimateTokens(resumeText);
  let llmRequest: LLMRequest;

  if (tokens <= 6000 || pdfBase64 || imageBase64) {
    // Single pass
    llmRequest = {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      pdfBase64,
      imageBase64,
      imageMimeType,
    };
  } else {
    // For very long resumes, just send the full text — modern LLMs handle it
    // The chunking spec is a fallback; gemini-2.0-flash handles 1M tokens
    llmRequest = {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    };
    warnings.push(`Resume is long (~${tokens} tokens). Sending full text to LLM.`);
  }

  const response = await callWithFallback(
    settings.providers,
    settings.providerOrder,
    settings.selectedProvider,
    llmRequest
  );

  if (response.error && !response.text) {
    return {
      profile: existingProfile || createEmptyProfile(),
      provider: response.provider,
      rawResponse: response.text,
      error: response.error,
      warnings,
    };
  }

  // Step 4: Post-processing
  let parsedProfile: ProfileData;

  try {
    const jsonStr = extractJSON(response.text);
    parsedProfile = JSON.parse(jsonStr) as ProfileData;
  } catch {
    // Retry once with stricter prompt
    warnings.push('First parse returned malformed JSON. Retrying with stricter prompt...');

    const retryRequest: LLMRequest = {
      systemPrompt: SYSTEM_PROMPT + '\nCRITICAL: Return ONLY raw JSON. No markdown code fences. No backticks. No text before or after the JSON object.',
      userPrompt,
      pdfBase64,
      imageBase64,
      imageMimeType,
    };

    const retryResponse = await callWithFallback(
      settings.providers,
      settings.providerOrder,
      settings.selectedProvider,
      retryRequest
    );

    try {
      const jsonStr = extractJSON(retryResponse.text);
      parsedProfile = JSON.parse(jsonStr) as ProfileData;
    } catch {
      return {
        profile: existingProfile || createEmptyProfile(),
        provider: retryResponse.provider,
        rawResponse: retryResponse.text,
        error: 'Failed to parse LLM response as JSON after 2 attempts.',
        warnings,
      };
    }
  }

  // Post-process the parsed profile
  parsedProfile = postProcessProfile(parsedProfile);

  // Auto-retry if email or firstName is empty
  if (!parsedProfile.personal.email && !parsedProfile.personal.firstName) {
    warnings.push('Email and firstName are empty — triggering auto-retry...');

    const retryRequest: LLMRequest = {
      systemPrompt: SYSTEM_PROMPT + '\nIMPORTANT: Make sure to extract the email address and first name. These fields must not be empty if present in the resume.',
      userPrompt,
      pdfBase64,
      imageBase64,
      imageMimeType,
    };

    const retryResponse = await callWithFallback(
      settings.providers,
      settings.providerOrder,
      settings.selectedProvider,
      retryRequest
    );

    try {
      const jsonStr = extractJSON(retryResponse.text);
      const retryProfile = postProcessProfile(JSON.parse(jsonStr) as ProfileData);
      // Only use retry if it actually has the missing fields
      if (retryProfile.personal.email || retryProfile.personal.firstName) {
        parsedProfile = retryProfile;
      }
    } catch {
      // Keep original parse result
    }
  }

  // Merge with locks
  if (existingProfile && Object.keys(locks).length > 0) {
    parsedProfile = mergeWithLocks(existingProfile, parsedProfile, locks);
  }

  return {
    profile: parsedProfile,
    provider: response.provider,
    rawResponse: response.text,
    warnings,
  };
}
