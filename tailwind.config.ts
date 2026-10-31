import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: {
          DEFAULT: '#84CC16', // Electric Volt Lime
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        pulse: {
          DEFAULT: '#0284C7', // Pulse Cyan/Sky
          light: '#38BDF8',
          dark: '#0369A1',
        },
        status: {
          ok: '#059669', // Emerald
          caution: '#D97706', // Amber
          danger: '#DC2626', // Crimson/Red
          simulated: '#7C3AED', // Violet
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F8FAFC',
          subtle: '#F1F5F9',
          border: '#E2E8F0',
          borderSubtle: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'elevated': '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'volt-glow': '0 0 16px rgba(132, 204, 22, 0.35)',
        'pulse-glow': '0 0 16px rgba(2, 132, 199, 0.35)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
} satisfies Config;

