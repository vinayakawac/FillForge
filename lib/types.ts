// ============================================================
// FillForge — Core Type Definitions
// ============================================================

// ---- Profile Schema ----

export interface Address {
  street: string;
  city: string;
  state: string;
  stateCode: string;
  zip: string;
  country: string;
  countryCode: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  phoneAlt: string;
  linkedin: string;
  github: string;
  portfolio: string;
  twitter: string;
  website: string;
  address: Address;
}

export interface WorkExperience {
  company: string;
  title: string;
  department: string;
  location: string;
  locationType: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  current: boolean;
  bullets: string[];
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  degreeType: string;
  field: string;
  minor: string;
  gpa: string;
  maxGpa: string;
  startYear: string;
  endYear: string;
  location: string;
  honors: string;
  coursework: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueMonth: string;
  issueYear: string;
  expiryMonth: string;
  expiryYear: string;
  credentialId: string;
  url: string;
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface Project {
  name: string;
  description: string;
  url: string;
  github: string;
  tech: string[];
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Publication {
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
}

export interface Award {
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Volunteer {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Demographics {
  authorizedToWork: string;
  requiresSponsorship: string;
  veteranStatus: string;
  disabilityStatus: string;
  gender: string;
  ethnicity: string;
  pronouns: string;
}

export interface Preferences {
  desiredSalaryMin: string;
  desiredSalaryMax: string;
  salaryCurrency: string;
  salaryType: string;
  noticePeriod: string;
  willingToRelocate: string;
  remotePreference: string;
  desiredJobTypes: string[];
}

export interface ProfileData {
  personal: PersonalInfo;
  summary: string;
  objective: string;
  work: WorkExperience[];
  education: Education[];
  skills: string[];
  skillsByCategory: Record<string, string[]>;
  certifications: Certification[];
  languages: Language[];
  projects: Project[];
  publications: Publication[];
  awards: Award[];
  volunteer: Volunteer[];
  demographics: Demographics;
  preferences: Preferences;
}

// ---- Provider Types ----

export type ProviderType = 'gemini' | 'groq' | 'ollama-local' | 'ollama-cloud' | 'openrouter';

export interface ProviderConfig {
  type: ProviderType;
  apiKey: string; // encrypted
  model?: string; // user override
  enabled: boolean;
}

export interface ProviderStatus {
  type: ProviderType;
  status: 'idle' | 'loading' | 'success' | 'error' | 'rate-limited';
  message?: string;
  lastUsed?: number;
}

// ---- Fill Types ----

export type FillMethod = 'exact-map' | 'scored' | 'skipped';
export type ATSPlatform = 'workday' | 'greenhouse' | 'lever' | 'icims' | 'taleo' | 'smartrecruiters' | 'jobvite' | 'ashby' | 'rippling' | 'generic';

export interface FillResult {
  field: string;
  selector: string;
  value: string;
  method: FillMethod;
  confidence: number;
  filled: boolean;
  reason?: string; // if skipped
}

export interface FillOperation {
  id: string;
  site: string;
  hostname: string;
  platform: ATSPlatform;
  date: number; // timestamp
  results: FillResult[];
  filledCount: number;
  skippedCount: number;
  provider?: ProviderType;
}

// ---- Settings Types ----

export interface FillForgeSettings {
  selectedProvider: ProviderType;
  providers: Record<ProviderType, ProviderConfig>;
  providerOrder: ProviderType[]; // fallback chain
  fillEEO: boolean;
  skipExistingContent: boolean;
  showConfidenceOverlay: boolean;
}

// ---- Field Locking ----

export interface FieldLocks {
  [path: string]: boolean; // e.g. "personal.firstName" => true
}

// ---- Storage Shape ----

export interface FillForgeStorage {
  fillforge_profile: ProfileData | null;
  fillforge_settings: FillForgeSettings;
  fillforge_locks: FieldLocks;
  fillforge_history: FillOperation[];
  fillforge_debug_llm_response: string;
  fillforge_debug_fill_log: FillResult[];
  fillforge_resume_filename: string;
  fillforge_parse_provider: ProviderType | null;
}

// ---- Messaging ----

export type MessageType =
  | 'PARSE_RESUME'
  | 'GET_PROFILE'
  | 'UPDATE_PROFILE'
  | 'FILL_PAGE'
  | 'FILL_RESULT'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'GET_HISTORY'
  | 'CLEAR_ALL_DATA'
  | 'GET_DEBUG';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

// ---- Helpers ----

export function createEmptyProfile(): ProfileData {
  return {
    personal: {
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      phone: '',
      phoneAlt: '',
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        stateCode: '',
        zip: '',
        country: '',
        countryCode: '',
      },
    },
    summary: '',
    objective: '',
    work: [],
    education: [],
    skills: [],
    skillsByCategory: {},
    certifications: [],
    languages: [],
    projects: [],
    publications: [],
    awards: [],
    volunteer: [],
    demographics: {
      authorizedToWork: '',
      requiresSponsorship: '',
      veteranStatus: '',
      disabilityStatus: '',
      gender: '',
      ethnicity: '',
      pronouns: '',
    },
    preferences: {
      desiredSalaryMin: '',
      desiredSalaryMax: '',
      salaryCurrency: '',
      salaryType: '',
      noticePeriod: '',
      willingToRelocate: '',
      remotePreference: '',
      desiredJobTypes: [],
    },
  };
}

export function createDefaultSettings(): FillForgeSettings {
  return {
    selectedProvider: 'gemini',
    providers: {
      'gemini': { type: 'gemini', apiKey: '', enabled: true },
      'groq': { type: 'groq', apiKey: '', enabled: false },
      'ollama-local': { type: 'ollama-local', apiKey: '', enabled: false },
      'ollama-cloud': { type: 'ollama-cloud', apiKey: '', enabled: false },
      'openrouter': { type: 'openrouter', apiKey: '', enabled: false },
    },
    providerOrder: ['gemini', 'groq', 'openrouter', 'ollama-cloud', 'ollama-local'],
    fillEEO: false,
    skipExistingContent: true,
    showConfidenceOverlay: true,
  };
}
