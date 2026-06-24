// ============================================================
// FillForge — Field Aliases for Generic ATS Matching
// ============================================================

import type { ProfileData } from './types';

export const FIELD_ALIASES: Record<string, string[]> = {
  firstName: ['first name', 'given name', 'first', 'fname', 'forename'],
  lastName: ['last name', 'surname', 'last', 'lname', 'family name'],
  fullName: ['full name', 'name', 'your name', 'candidate name', 'applicant name'],
  email: ['email', 'e-mail', 'email address'],
  phone: ['phone', 'mobile', 'telephone', 'cell', 'contact number', 'phone number'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'postal', 'postcode', 'pin code', 'zip code', 'postal code'],
  country: ['country', 'nation'],
  street: ['street', 'address', 'street address', 'address line 1', 'address line'],
  linkedin: ['linkedin', 'linked in', 'linkedin url', 'linkedin profile'],
  github: ['github', 'git hub', 'github url', 'github profile'],
  portfolio: ['portfolio', 'personal website', 'website url', 'portfolio url'],
  website: ['website', 'web site', 'personal site', 'url'],
  company: ['company', 'employer', 'organization', 'organisation', 'current employer', 'current company'],
  title: ['title', 'position', 'job title', 'role', 'current title', 'current position'],
  summary: ['summary', 'professional summary', 'about', 'about me', 'bio', 'overview'],
  gpa: ['gpa', 'grade point average', 'cgpa'],
  degree: ['degree', 'qualification', 'education level'],
  school: ['school', 'university', 'institution', 'college', 'alma mater'],
  major: ['major', 'field of study', 'specialization', 'concentration', 'field'],
  salary: ['salary', 'desired salary', 'salary expectation', 'expected salary', 'compensation'],
};

// Blocked field names — never fill these
export const BLOCKED_FIELDS: string[] = [
  'cover letter', 'coverletter', 'cover_letter',
  'additional information', 'additional_information', 'additionalinfo',
  'how did you hear', 'how_did_you_hear', 'howdidyouhear', 'referral source',
  'ssn', 'social security', 'social_security_number',
  'passport', 'passport number', 'passport_number',
  'government id', 'government_id', 'national id', 'national_id',
  'drivers license', 'driver_license', 'driving_licence',
];

// EEO / Demographic fields — only fill if user explicitly enables
export const EEO_FIELDS: string[] = [
  'gender', 'sex', 'race', 'ethnicity', 'ethnic',
  'veteran', 'disability', 'disabled',
  'sexual orientation', 'pronoun', 'pronouns',
];

/**
 * Given a profile and a field alias key, return the value from the profile.
 */
export function getProfileValue(profile: ProfileData, fieldKey: string): string {
  switch (fieldKey) {
    case 'firstName': return profile.personal.firstName;
    case 'lastName': return profile.personal.lastName;
    case 'fullName': return profile.personal.fullName || `${profile.personal.firstName} ${profile.personal.lastName}`.trim();
    case 'email': return profile.personal.email;
    case 'phone': return profile.personal.phone;
    case 'city': return profile.personal.address.city;
    case 'state': return profile.personal.address.state || profile.personal.address.stateCode;
    case 'zip': return profile.personal.address.zip;
    case 'country': return profile.personal.address.country || profile.personal.address.countryCode;
    case 'street': return profile.personal.address.street;
    case 'linkedin': return profile.personal.linkedin;
    case 'github': return profile.personal.github;
    case 'portfolio': return profile.personal.portfolio;
    case 'website': return profile.personal.website || profile.personal.portfolio;
    case 'company': return profile.work[0]?.company ?? '';
    case 'title': return profile.work[0]?.title ?? '';
    case 'summary': return profile.summary;
    case 'gpa': return profile.education[0]?.gpa ?? '';
    case 'degree': return profile.education[0]?.degree ?? '';
    case 'school': return profile.education[0]?.institution ?? '';
    case 'major': return profile.education[0]?.field ?? '';
    case 'salary': return profile.preferences.desiredSalaryMin
      ? `${profile.preferences.desiredSalaryMin}${profile.preferences.desiredSalaryMax ? '-' + profile.preferences.desiredSalaryMax : ''}`
      : '';
    default: return '';
  }
}

/**
 * Cross-validate that a value makes sense for the field it's being assigned to.
 * Prevents the user's name from being filled into a "company" field and vice versa.
 */
export function validateFieldCrossCheck(profile: ProfileData, fieldKey: string, value: string): boolean {
  if (!value) return true;
  const nameParts = [
    profile.personal.firstName?.toLowerCase(),
    profile.personal.lastName?.toLowerCase(),
    profile.personal.fullName?.toLowerCase(),
  ].filter(Boolean);

  // Don't put a person's name into a company/title/school field
  if (['company', 'school', 'major', 'degree'].includes(fieldKey)) {
    for (const name of nameParts) {
      if (name && (value.toLowerCase() === name || value.toLowerCase().includes(name))) {
        return false;
      }
    }
  }

  // Don't put a company name into a name field
  if (['firstName', 'lastName', 'fullName'].includes(fieldKey)) {
    const companyName = profile.work[0]?.company?.toLowerCase();
    if (companyName && value.toLowerCase() === companyName) {
      return false;
    }
  }

  return true;
}

/**
 * Validate value type matches expected field type.
 * Prevents phone numbers going into email fields, etc.
 */
export function validateFieldType(fieldKey: string, value: string): boolean {
  if (!value) return true;

  if (fieldKey === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  if (fieldKey === 'phone') {
    return /[\d\s()+\-]{7,}/.test(value);
  }
  if (fieldKey === 'linkedin') {
    return /linkedin\.com/i.test(value) || value.startsWith('http');
  }
  if (fieldKey === 'github') {
    return /github\.com/i.test(value) || value.startsWith('http');
  }
  if (fieldKey === 'zip') {
    return /^[\d\s\-A-Z]{3,10}$/i.test(value);
  }

  return true;
}

/**
 * Check if a field signal matches any blocked field patterns.
 */
export function isBlockedField(signal: string): boolean {
  const lower = signal.toLowerCase().trim();
  return BLOCKED_FIELDS.some(b => lower.includes(b) || b.includes(lower));
}

/**
 * Check if a field signal matches EEO/demographic fields.
 */
export function isEEOField(signal: string): boolean {
  const lower = signal.toLowerCase().trim();
  return EEO_FIELDS.some(e => lower.includes(e));
}
