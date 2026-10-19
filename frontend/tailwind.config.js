/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        cream: '#FBF7F0',
        ink: '#2B2622',
        muted: '#8A817A',
        line: '#EDE6DC',
        brand: {
          DEFAULT: '#0F9E8E',
          dark: '#0B7C70',
          soft: '#E6F6F3',
        },
      },
    },
  },
  plugins: [],
};
