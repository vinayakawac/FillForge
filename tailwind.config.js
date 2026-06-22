/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/popup/**/*.{html,tsx,ts}',
    './components/**/*.{tsx,ts}',
  ],
  theme: {
    extend: {
      colors: {
        ff: {
          'bg-primary': '#0f0f0f',
          'bg-secondary': '#1a1a1a',
          'bg-elevated': '#232323',
          'border': '#2e2e2e',
          'text-primary': '#e8e8e8',
          'text-secondary': '#888888',
          'text-muted': '#555555',
          'accent': '#6b7cff',
          'accent-hover': '#8b9aff',
          'success': '#4caf82',
          'warning': '#e8a838',
          'error': '#e85858',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', "'Segoe UI'", 'sans-serif'],
      },
      borderRadius: {
        'component': '6px',
        'input': '4px',
      },
    },
  },
  plugins: [],
};
