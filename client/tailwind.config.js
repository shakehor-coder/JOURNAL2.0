/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Golos Text',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'IBM Plex Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace'
        ],
      },
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent)',
          contrast: '#ffffff',
        },
        highlight: 'var(--highlight)',
        'on-highlight': 'var(--on-highlight)',
        'side-bg': 'var(--side-bg)',
        'side-text': 'var(--side-text)',
        'on-ink': 'var(--on-ink)',
        line: 'var(--line)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '6px',
        md: '6px',
        lg: '10px',
        xl: '10px',
        '2xl': '10px',
      },
      boxShadow: {
        card: '4px 4px 0 var(--ink)',
        dropdown: '4px 4px 0 var(--ink)',
        hard: '4px 4px 0 var(--ink)',
        'hard-sm': '3px 3px 0 var(--ink)',
        'hard-xs': '2px 2px 0 var(--ink)',
      },
      transitionDuration: {
        DEFAULT: '120ms',
        fast: '120ms',
        base: '150ms',
      },
    },
  },
  plugins: [],
}
