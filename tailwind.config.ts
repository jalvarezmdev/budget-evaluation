import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#334155',
        input: '#334155',
        ring: '#38BDF8',
        background: '#0F172A',
        foreground: '#E2E8F0',
        tertiary: {
          DEFAULT: '#4ADE80',
          foreground: '#052E16'
        },
        primary: {
          DEFAULT: '#38BDF8',
          foreground: '#082F49'
        },
        secondary: {
          DEFAULT: '#1E293B',
          foreground: '#E2E8F0'
        },
        muted: {
          DEFAULT: '#1E293B',
          foreground: '#94A3B8'
        },
        accent: {
          DEFAULT: '#172135',
          foreground: '#E2E8F0'
        },
        card: {
          DEFAULT: '#18233A',
          foreground: '#E2E8F0'
        },
        popover: {
          DEFAULT: '#1A2741',
          foreground: '#E2E8F0'
        },
        destructive: {
          DEFAULT: '#F87171',
          foreground: '#450A0A'
        }
      },
      borderRadius: {
        lg: '0.85rem',
        md: '0.65rem',
        sm: '0.45rem'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.15), 0 16px 32px rgba(2, 6, 23, 0.35)',
        soft: '0 10px 24px rgba(2, 6, 23, 0.25)'
      }
    }
  },
  plugins: []
};

export default config;
