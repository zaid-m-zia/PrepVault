/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-bg) / <alpha-value>)',
        'primary-text': 'rgb(var(--color-text) / <alpha-value>)',
        'secondary-text': 'rgb(var(--color-muted) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        brand: 'rgb(var(--color-primary) / <alpha-value>)',
        'accent-from': '#6366f1',
        'accent-to': '#4f46e5',
        cta: '#6366f1',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glow: '0 8px 30px rgba(99,102,241,0.18)',
      },
      borderRadius: {
        lg: '12px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

