/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fef7ed",
          100: "#fdecd3",
          200: "#fad5a5",
          300: "#f6b76d",
          400: "#f19132",
          500: "#ee7710",
          600: "#df5d06",
          700: "#b94409",
          800: "#93360e",
          900: "#782f0f",
        },
      },
    },
  },
  plugins: [],
};
