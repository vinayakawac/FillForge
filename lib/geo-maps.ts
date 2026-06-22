// ============================================================
// FillForge — Geographic Maps
// US States + ISO 3166 Country Codes
// ============================================================

export const US_STATES: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
  // Territories
  'district of columbia': 'DC', 'puerto rico': 'PR', 'guam': 'GU',
  'american samoa': 'AS', 'u.s. virgin islands': 'VI', 'northern mariana islands': 'MP',
};

export const COUNTRIES: Record<string, string> = {
  'united states': 'US', 'united states of america': 'US', 'usa': 'US', 'us': 'US',
  'canada': 'CA', 'united kingdom': 'GB', 'uk': 'GB', 'great britain': 'GB', 'england': 'GB',
  'australia': 'AU', 'india': 'IN', 'germany': 'DE', 'france': 'FR', 'spain': 'ES',
  'italy': 'IT', 'japan': 'JP', 'china': 'CN', 'brazil': 'BR', 'mexico': 'MX',
  'south korea': 'KR', 'netherlands': 'NL', 'sweden': 'SE', 'norway': 'NO',
  'denmark': 'DK', 'finland': 'FI', 'switzerland': 'CH', 'austria': 'AT',
  'belgium': 'BE', 'ireland': 'IE', 'portugal': 'PT', 'poland': 'PL',
  'czech republic': 'CZ', 'czechia': 'CZ', 'romania': 'RO', 'hungary': 'HU',
  'greece': 'GR', 'turkey': 'TR', 'russia': 'RU', 'ukraine': 'UA',
  'israel': 'IL', 'south africa': 'ZA', 'nigeria': 'NG', 'kenya': 'KE',
  'egypt': 'EG', 'morocco': 'MA', 'singapore': 'SG', 'malaysia': 'MY',
  'thailand': 'TH', 'vietnam': 'VN', 'philippines': 'PH', 'indonesia': 'ID',
  'taiwan': 'TW', 'hong kong': 'HK', 'new zealand': 'NZ', 'argentina': 'AR',
  'colombia': 'CO', 'chile': 'CL', 'peru': 'PE', 'pakistan': 'PK',
  'bangladesh': 'BD', 'sri lanka': 'LK', 'nepal': 'NP', 'uae': 'AE',
  'united arab emirates': 'AE', 'saudi arabia': 'SA', 'qatar': 'QA',
  'kuwait': 'KW', 'bahrain': 'BH', 'oman': 'OM', 'jordan': 'JO',
  'lebanon': 'LB', 'luxembourg': 'LU', 'iceland': 'IS', 'malta': 'MT',
  'cyprus': 'CY', 'estonia': 'EE', 'latvia': 'LV', 'lithuania': 'LT',
  'slovakia': 'SK', 'slovenia': 'SI', 'croatia': 'HR', 'serbia': 'RS',
  'bulgaria': 'BG', 'bosnia': 'BA', 'albania': 'AL', 'north macedonia': 'MK',
  'montenegro': 'ME', 'costa rica': 'CR', 'panama': 'PA', 'uruguay': 'UY',
  'ecuador': 'EC', 'venezuela': 'VE', 'dominican republic': 'DO',
  'jamaica': 'JM', 'trinidad': 'TT', 'trinidad and tobago': 'TT',
  'ghana': 'GH', 'ethiopia': 'ET', 'tanzania': 'TZ', 'uganda': 'UG',
  'cameroon': 'CM', 'ivory coast': 'CI', 'senegal': 'SN', 'tunisia': 'TN',
  'myanmar': 'MM', 'cambodia': 'KH', 'laos': 'LA', 'mongolia': 'MN',
  'uzbekistan': 'UZ', 'kazakhstan': 'KZ', 'georgia': 'GE', 'armenia': 'AM',
  'azerbaijan': 'AZ',
};

export function inferStateCode(stateName: string): string {
  if (!stateName) return '';
  const lower = stateName.toLowerCase().trim();

  // Already a code?
  if (/^[A-Z]{2}$/.test(stateName.trim())) return stateName.trim().toUpperCase();

  return US_STATES[lower] || '';
}

export function inferCountryCode(countryName: string): string {
  if (!countryName) return '';
  const lower = countryName.toLowerCase().trim();

  // Already a code?
  if (/^[A-Z]{2}$/.test(countryName.trim())) return countryName.trim().toUpperCase();

  return COUNTRIES[lower] || '';
}
