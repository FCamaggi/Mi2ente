/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Nunito', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        bg: 'var(--color-bg)',
        border: 'var(--color-border)',
        primary: {
          50:  'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
        },
        accent: 'var(--color-accent)',
        'grade-ok':   'var(--color-grade-ok)',
        'grade-fail': 'var(--color-grade-fail)',
        'grade-ok-text':   'var(--color-grade-ok-text)',
        'grade-fail-text': 'var(--color-grade-fail-text)',
      },
      textColor: {
        'theme-primary':   'var(--color-text-primary)',
        'theme-secondary': 'var(--color-text-secondary)',
        'theme-muted':     'var(--color-text-muted)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        theme: 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
      },
    }
  },
  plugins: []
};
