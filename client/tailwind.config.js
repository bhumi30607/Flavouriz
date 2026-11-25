/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F3EC',
        'forest-green': {
          DEFAULT: '#263D2C',
          light: '#35533D',
          dark: '#1B2C1F',
        },
        terracotta: {
          DEFAULT: '#D97A43',
          light: '#E59262',
          dark: '#BF622D',
        },
        charcoal: {
          DEFAULT: '#252525',
          light: '#404040',
          dark: '#181818',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(37, 37, 37, 0.06)',
        card: '0 8px 30px rgba(37, 37, 37, 0.08)',
        hover: '0 12px 35px rgba(38, 61, 44, 0.12)',
      },
    },
  },
  plugins: [],
};
