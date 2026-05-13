/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'off-white': '#F5F2ED',
      },
      boxShadow: {
        neobrutalist: '4px 4px 0px 0px #000000',
        'neobrutalist-sm': '2px 2px 0px 0px #000000',
        'neobrutalist-lg': '6px 6px 0px 0px #000000',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
