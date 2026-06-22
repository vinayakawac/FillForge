// ============================================================
// FillForge — ATS Platform Detector
// ============================================================

import type { ATSPlatform } from './types';

export function detectATS(hostname: string, _pathname?: string): ATSPlatform {
  if (/myworkday\.com|wd\d\.myworkday\.com/.test(hostname)) return 'workday';
  if (/greenhouse\.io|boards\.greenhouse\.io/.test(hostname)) return 'greenhouse';
  if (/lever\.co/.test(hostname)) return 'lever';
  if (/icims\.com/.test(hostname)) return 'icims';
  if (/taleo\.net/.test(hostname)) return 'taleo';
  if (/smartrecruiters\.com/.test(hostname)) return 'smartrecruiters';
  if (/jobvite\.com/.test(hostname)) return 'jobvite';
  if (/ashbyhq\.com/.test(hostname)) return 'ashby';
  if (/rippling\.com/.test(hostname)) return 'rippling';
  return 'generic';
}
