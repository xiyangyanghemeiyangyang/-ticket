/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        "primary-dark": "#1e40af",
        "primary-light": "#60a5fa",
        grayNeutral: "#f5f7fa"
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px"
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};