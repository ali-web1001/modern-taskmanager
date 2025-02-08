/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // colors: {
      //   // Dark mode palette
      //   dark: {
      //     900: "#0a0e17", // Darkest background
      //     800: "#141a24", // Secondary background
      //     700: "#1e2632", // Surface/component background
      //     600: "#28303f", // Borders/accents
      //   },
      //   // Light mode additions
      //   light: {
      //     text: "#0f172a", // Primary text
      //     100: "#f8fafc", // Base background
      //   },
      // },
    },
  },
  plugins: [],
};
