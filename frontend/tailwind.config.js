/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#18181b',
        card: '#27272a',
      },
    },
  },
  plugins: [],
};
