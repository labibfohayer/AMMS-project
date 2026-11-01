import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#4CAF50',
        },
        gold: '#F9A825',
        'light-green': '#F1F8E9',
        cream: {
          50: '#FFFEFC',
          100: '#FFFDF9',
          200: '#FAF6ED',
          300: '#F6F1E5',
          400: '#EFE8D8',
          500: '#E5DDCB',
          DEFAULT: '#FAF6ED',
        },
      },
      fontFamily: {
        sans: ['var(--font-sk-bishal)', 'SK Bishal', 'Li SK Bishal Unicode', 'Hind Siliguri', 'sans-serif'],
        bangla: ['var(--font-sk-bishal)', 'SK Bishal', 'Li SK Bishal Unicode', 'Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
