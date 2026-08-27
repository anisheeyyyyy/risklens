/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B1120',
        surface: {
          DEFAULT: '#111827',
          light: '#1F2937',
          dark: '#0B1120',
          elevated: '#1E293B',
          border: '#334155',
        },
        brand: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          DEFAULT: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        severity: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#10B981',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'glow-orange': '0 0 20px -3px rgba(249, 115, 22, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
