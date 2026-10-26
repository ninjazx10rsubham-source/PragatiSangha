/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        festive: {
          maroon: "#4A0E17",
          crimson: "#800020",
          gold: "#D4AF37",
          amber: "#FFBF00",
          warmbg: "#FDF8EA",
          cardbg: "#FFFDF7",
          border: "#EADBB6"
        }
      },
      fontFamily: {
        bengali: ['"Noto Sans Bengali"', '"Hind Siliguri"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
