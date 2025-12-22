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
        primary: '#0a0e27',
        'primary-text': '#ffffff',
        'secondary-text': '#94a3b8',
        'accent-from': '#06b6d4',
        'accent-to': '#a855f7',
        'border-accent': 'rgba(139,92,246,0.3)',
        cta: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif'],
      },
      boxShadow: {
        glow: '0 8px 30px rgba(6,182,212,0.07)',
      },
      borderRadius: {
        lg: '12px',
      },
    },
  },
  plugins: [],
};

