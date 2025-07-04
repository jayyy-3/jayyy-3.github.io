/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
        primary: '#00FF19',
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

