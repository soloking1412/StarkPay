import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          raised: '#16181f',
          border: '#1e2028',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f52d8',
          muted: '#6366f120',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#8b949e',
          muted: '#4d5566',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
