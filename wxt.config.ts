import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'FillForge',
    description: 'Parse resumes and auto-fill job application forms across ATS platforms',
    version: '1.0.0',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: [
      '*://*.myworkday.com/*',
      '*://*.greenhouse.io/*',
      '*://*.lever.co/*',
      '*://*.icims.com/*',
      '*://*.taleo.net/*',
      '*://*.smartrecruiters.com/*',
      '*://*.jobvite.com/*',
      '*://*.ashbyhq.com/*',
      '*://*.rippling.com/*',
      '*://*.linkedin.com/*',
      '*://*.indeed.com/*',
    ],
    icons: {
      '16': 'icon/16.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png',
    },
  },
});
