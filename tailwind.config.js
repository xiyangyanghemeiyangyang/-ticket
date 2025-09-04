/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue
          dark: "#1e40af",
          light: "#60a5fa"
        },
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

