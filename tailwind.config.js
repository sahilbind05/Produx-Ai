/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0A0A0A",
          900: "#111111",
          800: "#1A1A1A",
          700: "#252525",
          600: "#333333",
          500: "#555555",
          400: "#888888",
          300: "#AAAAAA",
          200: "#CCCCCC",
          100: "#F0EFEB",
        },
        jade: {
          600: "#2D6A4F",
          500: "#3D7A57",
          400: "#52A873",
          300: "#74C69D",
          100: "#D8F3DC",
        },
        amber: { 500: "#F59E0B", 400: "#FBBF24", 100: "#FEF3C7" },
        rose:  { 500: "#F43F5E", 100: "#FFE4E6" },
        sky:   { 500: "#0EA5E9", 100: "#E0F2FE" },
      },
    },
  },
  plugins: [],
};
