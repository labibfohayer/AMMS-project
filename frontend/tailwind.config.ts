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
          DEFAULT: '#1B4332',
          dark: '#112D22',
          light: '#2D6A4F',
        },
        forest: {
          950: '#0C2018',
          900: '#112D22',
          800: '#16382C',
          700: '#1B4332',
          600: '#245842',
          500: '#2D6A4F',
          400: '#40916C',
          300: '#52B788',
          200: '#74C69D',
          100: '#D8F3DC',
          50: '#F1F9F4',
        },
        heritage: {
          gold: '#C5A059',
          'gold-light': '#D4AF37',
          'gold-dark': '#9A7B38',
          brass: '#B38E46',
        },
        ivory: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F4F1EA',
          DEFAULT: '#F8F9FA',
        },
        gold: '#C5A059',
        'light-green': '#F1F9F4',
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F4F1EA',
          300: '#EBE7DD',
          400: '#E0DACD',
          500: '#D1C9B8',
          DEFAULT: '#F8F9FA',
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
