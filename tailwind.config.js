/** @type {import('tailwindcss').Config} */
const percentageOpacity = Object.fromEntries(
  Array.from({ length: 101 }, (_, value) => [String(value), String(value / 100)]),
)

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
        primary: '#00FF19',
        opacity: percentageOpacity,
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
