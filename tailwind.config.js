/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'primary-light': '#EDE9FE',
        'primary-dark': '#5B21B6',
        secondary: '#06B6D4',
        background: '#F8F7FF',
      },
    },
  },
  plugins: [],
};
